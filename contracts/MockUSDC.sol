// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice A mock USDC token for testing purposes
 * @dev Implements ERC20 with 6 decimals to match real USDC
 */
contract MockUSDC is ERC20 {
    uint8 private constant DECIMALS = 6;
    
    /**
     * @notice Constructor that creates the mock USDC token
     */
    constructor() ERC20("Mock USD Coin", "USDC") {
        // Mint 1 million USDC to deployer for testing
        _mint(msg.sender, 1_000_000 * 10 ** DECIMALS);
    }

    /**
     * @notice Returns the number of decimals (6, same as real USDC)
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Mints tokens to a specific address (for testing purposes)
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Burns tokens from caller's balance (for testing purposes)
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @notice Convenient function to mint tokens with human-readable amounts
     * @param to Address to mint tokens to
     * @param amount Amount in USDC (will be converted to wei automatically)
     */
    function mintUSDC(address to, uint256 amount) external {
        _mint(to, amount * 10 ** DECIMALS);
    }
}