// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ILiveLedger
 * @notice Interface for the LiveLedger payment streaming contract
 * @dev This interface defines the core functionality for creating, managing, and withdrawing from payment streams
 */
interface ILiveLedger {
    /**
     * @notice Structure representing a payment stream
     * @param payer Address of the account that created and funds the stream
     * @param recipient Address of the account that can withdraw from the stream
     * @param token Address of the ERC20 token being streamed (e.g., USDC)
     * @param totalAmount Total amount deposited for this stream
     * @param withdrawn Total amount already withdrawn by the recipient
     * @param startTime Unix timestamp when the stream begins
     * @param endTime Unix timestamp when the stream ends
     * @param maxWithdrawalsPerDay Maximum number of withdrawals allowed per day
     * @param active Whether the stream is currently active (not cancelled)
     */
    struct Stream {
        address payer;
        address recipient;
        address token;
        uint128 totalAmount;
        uint128 withdrawn;
        uint64 startTime;
        uint64 endTime;
        uint8 maxWithdrawalsPerDay;
        bool active;
    }

    /**
     * @notice Emitted when a new stream is created
     * @param streamId Unique identifier for the stream
     * @param payer Address of the payer
     * @param recipient Address of the recipient
     * @param token Address of the token being streamed
     * @param totalAmount Total amount deposited
     * @param ratePerSecond Token amount per second
     * @param startTime Stream start time
     * @param endTime Stream end time
     * @param maxWithdrawalsPerDay Daily withdrawal limit
     */
    event StreamCreated(
        uint256 indexed streamId,
        address indexed payer,
        address indexed recipient,
        address token,
        uint128 totalAmount,
        uint128 ratePerSecond,
        uint64 startTime,
        uint64 endTime,
        uint8 maxWithdrawalsPerDay
    );

    /**
     * @notice Emitted when a recipient withdraws from a stream
     * @param streamId Stream identifier
     * @param recipient Address of the recipient
     * @param amount Amount withdrawn
     * @param dayIndex Day index since stream start
     * @param withdrawalsUsed Number of withdrawals used this day
     */
    event Withdraw(
        uint256 indexed streamId,
        address indexed recipient,
        uint128 amount,
        uint32 dayIndex,
        uint8 withdrawalsUsed
    );

    /**
     * @notice Emitted when a stream is cancelled by the payer
     * @param streamId Stream identifier
     * @param payer Address of the payer
     * @param refunded Amount refunded to payer
     * @param lockedForRecipient Amount locked for recipient to withdraw
     */
    event StreamCancelled(
        uint256 indexed streamId,
        address indexed payer,
        uint128 refunded,
        uint128 lockedForRecipient
    );

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
    ) external returns (uint256 streamId);

    /**
     * @notice Calculates the claimable amount for a stream at current time
     * @param streamId Stream identifier
     * @return claimable Amount that can be withdrawn right now
     */
    function getClaimable(uint256 streamId) external view returns (uint128 claimable);

    /**
     * @notice Withdraws available tokens from a stream
     * @param streamId Stream identifier
     * @dev Only callable by the stream recipient, respects daily withdrawal limits
     */
    function withdraw(uint256 streamId) external;

    /**
     * @notice Cancels an active stream
     * @param streamId Stream identifier
     * @dev Only callable by the stream payer. Refunds unaccrued amount to payer,
     *      leaves accrued amount available for recipient withdrawal
     */
    function cancelStream(uint256 streamId) external;

    /**
     * @notice Gets complete stream information
     * @param streamId Stream identifier
     * @return stream The stream struct
     */
    function getStream(uint256 streamId) external view returns (Stream memory stream);

    /**
     * @notice Gets the number of withdrawals used for a specific day
     * @param streamId Stream identifier
     * @param dayIndex Day index since stream start (0-based)
     * @return withdrawals Number of withdrawals used that day
     */
    function getWithdrawalsPerDay(uint256 streamId, uint32 dayIndex) external view returns (uint8 withdrawals);

    /**
     * @notice Gets the current day index for a stream
     * @param streamId Stream identifier
     * @return dayIndex Current day index since stream start
     */
    function getCurrentDayIndex(uint256 streamId) external view returns (uint32 dayIndex);

    /**
     * @notice Gets the total number of streams created
     * @return count Total stream count
     */
    function getStreamCount() external view returns (uint256 count);
}