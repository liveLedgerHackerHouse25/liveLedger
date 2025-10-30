// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ILiveLedger.sol";

/**
 * @title LiveLedger
 * @notice A payment streaming contract that converts lump-sum deposits into real-time micropayments
 * @dev Allows payers to deposit tokens and stream them to recipients over time with daily withdrawal limits
 * @author LiveLedger Team
 */
contract LiveLedger is ILiveLedger, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Mapping from stream ID to stream data
    mapping(uint256 => Stream) public streams;
    
    /// @notice Mapping from stream ID to day index to number of withdrawals
    mapping(uint256 => mapping(uint32 => uint8)) public withdrawalsPerDay;
    
    /// @notice Counter for generating unique stream IDs
    uint256 public streamCount;

    /// @notice Error thrown when caller is not authorized for the operation
    error Unauthorized();
    
    /// @notice Error thrown when a stream is not active
    error StreamNotActive();
    
    /// @notice Error thrown when stream has not started yet
    error StreamNotStarted();
    
    /// @notice Error thrown when there's nothing to withdraw
    error NothingToWithdraw();
    
    /// @notice Error thrown when daily withdrawal limit is exceeded
    error DailyLimitExceeded();
    
    /// @notice Error thrown for invalid input parameters
    error InvalidParameter();

    /**
     * @notice Creates a new payment stream
     * @param recipient Address that will receive the streamed tokens
     * @param token Address of the ERC20 token to stream
     * @param totalAmount Total amount to be streamed over the duration
     * @param ratePerSecond Amount of tokens to stream per second
     * @param duration Duration of the stream in seconds
     * @param maxWithdrawalsPerDay Maximum withdrawals allowed per day
     * @return streamId Unique identifier for the created stream
     */
    function createStream(
        address recipient,
        address token,
        uint128 totalAmount,
        uint128 ratePerSecond,
        uint64 duration,
        uint8 maxWithdrawalsPerDay
    ) external nonReentrant returns (uint256 streamId) {
        // Input validation
        if (recipient == address(0)) revert InvalidParameter();
        if (token == address(0)) revert InvalidParameter();
        if (totalAmount == 0) revert InvalidParameter();
        if (ratePerSecond == 0) revert InvalidParameter();
        if (duration == 0) revert InvalidParameter();
        if (maxWithdrawalsPerDay == 0) revert InvalidParameter();
        
        // Ensure math consistency: totalAmount should equal ratePerSecond * duration
        if (totalAmount != uint128(ratePerSecond) * duration) revert InvalidParameter();

        // Generate new stream ID
        streamId = streamCount++;
        
        uint64 startTime = uint64(block.timestamp);
        uint64 endTime = startTime + duration;

        // Create stream
        streams[streamId] = Stream({
            payer: msg.sender,
            recipient: recipient,
            token: token,
            totalAmount: totalAmount,
            withdrawn: 0,
            startTime: startTime,
            endTime: endTime,
            maxWithdrawalsPerDay: maxWithdrawalsPerDay,
            active: true
        });

        // Transfer tokens from payer to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            token,
            totalAmount,
            ratePerSecond,
            startTime,
            endTime,
            maxWithdrawalsPerDay
        );
    }

    /**
     * @notice Calculates the claimable amount for a stream at current time
     * @param streamId Stream identifier
     * @return claimable Amount that can be withdrawn right now
     */
    function getClaimable(uint256 streamId) public view returns (uint128 claimable) {
        Stream memory stream = streams[streamId];
        
        if (!stream.active) return 0;
        if (block.timestamp < stream.startTime) return 0;
        
        // Calculate elapsed time (capped at stream duration)
        uint64 currentTime = uint64(block.timestamp);
        uint64 elapsedTime;
        
        if (currentTime >= stream.endTime) {
            elapsedTime = stream.endTime - stream.startTime;
        } else {
            elapsedTime = currentTime - stream.startTime;
        }
        
        // Calculate total accrued amount
        uint128 ratePerSecond = stream.totalAmount / (stream.endTime - stream.startTime);
        uint128 accruedAmount = uint128(elapsedTime) * ratePerSecond;
        
        // Subtract already withdrawn amount
        if (accruedAmount > stream.withdrawn) {
            claimable = accruedAmount - stream.withdrawn;
        } else {
            claimable = 0;
        }
    }

    /**
     * @notice Withdraws available tokens from a stream
     * @param streamId Stream identifier
     * @dev Only callable by the stream recipient, respects daily withdrawal limits
     */
    function withdraw(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        
        // Authorization check
        if (msg.sender != stream.recipient) revert Unauthorized();
        if (!stream.active) revert StreamNotActive();
        if (block.timestamp < stream.startTime) revert StreamNotStarted();
        
        // Calculate claimable amount
        uint128 claimableAmount = getClaimable(streamId);
        if (claimableAmount == 0) revert NothingToWithdraw();
        
        // Check daily withdrawal limit
        uint32 dayIndex = getCurrentDayIndex(streamId);
        uint8 withdrawalsToday = withdrawalsPerDay[streamId][dayIndex];
        
        if (withdrawalsToday >= stream.maxWithdrawalsPerDay) revert DailyLimitExceeded();
        
        // Update state
        stream.withdrawn += claimableAmount;
        withdrawalsPerDay[streamId][dayIndex] = withdrawalsToday + 1;
        
        // Transfer tokens
        IERC20(stream.token).safeTransfer(stream.recipient, claimableAmount);
        
        emit Withdraw(
            streamId,
            stream.recipient,
            claimableAmount,
            dayIndex,
            withdrawalsToday + 1
        );
    }

    /**
     * @notice Cancels an active stream
     * @param streamId Stream identifier
     * @dev Only callable by the stream payer. Refunds unaccrued amount to payer,
     *      leaves accrued amount available for recipient withdrawal
     */
    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        
        // Authorization check
        if (msg.sender != stream.payer) revert Unauthorized();
        if (!stream.active) revert StreamNotActive();
        
        // Calculate amounts
        uint128 claimableAmount = getClaimable(streamId);
        uint128 totalClaimable = stream.withdrawn + claimableAmount;
        uint128 refundAmount = stream.totalAmount - totalClaimable;
        
        // Mark stream as inactive
        stream.active = false;
        
        // Refund unaccrued amount to payer
        if (refundAmount > 0) {
            IERC20(stream.token).safeTransfer(stream.payer, refundAmount);
        }
        
        emit StreamCancelled(
            streamId,
            stream.payer,
            refundAmount,
            claimableAmount
        );
    }

    /**
     * @notice Gets complete stream information
     * @param streamId Stream identifier
     * @return stream The stream struct
     */
    function getStream(uint256 streamId) external view returns (Stream memory stream) {
        return streams[streamId];
    }

    /**
     * @notice Gets the number of withdrawals used for a specific day
     * @param streamId Stream identifier
     * @param dayIndex Day index since stream start (0-based)
     * @return withdrawals Number of withdrawals used that day
     */
    function getWithdrawalsPerDay(uint256 streamId, uint32 dayIndex) external view returns (uint8 withdrawals) {
        return withdrawalsPerDay[streamId][dayIndex];
    }

    /**
     * @notice Gets the current day index for a stream
     * @param streamId Stream identifier
     * @return dayIndex Current day index since stream start
     */
    function getCurrentDayIndex(uint256 streamId) public view returns (uint32 dayIndex) {
        Stream memory stream = streams[streamId];
        if (block.timestamp < stream.startTime) return 0;
        
        dayIndex = uint32((block.timestamp - stream.startTime) / 1 days);
    }

    /**
     * @notice Gets the total number of streams created
     * @return count Total stream count
     */
    function getStreamCount() external view returns (uint256 count) {
        return streamCount;
    }

    /**
     * @notice Gets the rate per second for a stream
     * @param streamId Stream identifier
     * @return ratePerSecond Rate per second for the stream
     */
    function getRatePerSecond(uint256 streamId) external view returns (uint128 ratePerSecond) {
        Stream memory stream = streams[streamId];
        if (stream.endTime <= stream.startTime) return 0;
        return stream.totalAmount / (stream.endTime - stream.startTime);
    }

    /**
     * @notice Checks if a stream is currently active and running
     * @param streamId Stream identifier
     * @return isActive True if stream is active and within time bounds
     */
    function isStreamActive(uint256 streamId) external view returns (bool isActive) {
        Stream memory stream = streams[streamId];
        return stream.active && 
               block.timestamp >= stream.startTime && 
               block.timestamp < stream.endTime;
    }

    /**
     * @notice Gets stream statistics
     * @param streamId Stream identifier
     * @return totalAmount Total amount in the stream
     * @return withdrawn Amount already withdrawn
     * @return claimable Amount currently claimable
     * @return remaining Amount remaining (unaccrued)
     */
    function getStreamStats(uint256 streamId) external view returns (
        uint128 totalAmount,
        uint128 withdrawn,
        uint128 claimable,
        uint128 remaining
    ) {
        Stream memory stream = streams[streamId];
        totalAmount = stream.totalAmount;
        withdrawn = stream.withdrawn;
        claimable = getClaimable(streamId);
        remaining = totalAmount - withdrawn - claimable;
    }
}