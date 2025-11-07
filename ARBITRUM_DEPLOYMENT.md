# 🚀 Quick Arbitrum Mainnet Deployment Guide

## Step 1: Create Alchemy Account
1. Go to [alchemy.com](https://alchemy.com) 
2. Sign up for free
3. Create new app:
   - **Chain**: Arbitrum  
   - **Network**: Arbitrum Mainnet
   - **Name**: LiveLedger-Mainnet
4. Copy your API key (starts with `alch_`)

## Step 2: Update .env File
Replace these values in your `.env` file:

```bash
# Replace YOUR_ALCHEMY_API_KEY_HERE with your actual Alchemy API key
ARBITRUM_ONE_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY_HERE

# Replace with your secure mainnet private key (NOT the testnet one!)
MAINNET_PRIVATE_KEY=YOUR_SECURE_MAINNET_PRIVATE_KEY_HERE
```

## Step 3: Fund Your Wallet
- Send ~0.005 ETH to your deployment wallet on Arbitrum One
- Gas fees are much cheaper than Ethereum mainnet (~$1-5 total)

## Step 4: Run Pre-Deployment Check
```bash
npx hardhat run scripts/pre-deployment-check.ts --network arbitrumOne
```

## Step 5: Deploy to Arbitrum Mainnet
```bash
npx hardhat compile
npx hardhat run scripts/deploy-arbitrum-mainnet.ts --network arbitrumOne
```

## Step 6: Verify Contract (Optional but Recommended)
```bash
npx hardhat verify --network arbitrumOne CONTRACT_ADDRESS
```

## Important Notes:
- ⚠️ **NEVER** commit your private key to git
- 🧪 **TEST** with small amounts first  
- 💰 **Gas fees** on Arbitrum are ~100x cheaper than Ethereum mainnet
- 🔍 **Explorer**: https://arbiscan.io for viewing your deployed contract

## Supported Tokens on Arbitrum:
- **USDC**: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- **USDT**: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`  
- **DAI**: `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1`