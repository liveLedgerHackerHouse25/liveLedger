# 🚀 LiveLedger Contract Deployment Guide

## Prerequisites

### 1. Environment Setup
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your configuration in `.env`:
   ```bash
   # Required for deployment
   ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
   ARBITRUM_PRIVATE_KEY=your_private_key_here_without_0x_prefix
   
   # Will be filled automatically after deployment
   LIVE_LEDGER_CONTRACT_ADDRESS=
   MOCK_USDC_ADDRESS=
   ```

### 2. Get Arbitrum Sepolia ETH
- Visit [Arbitrum Sepolia Faucet](https://faucet.arbitrum.io/)
- Or use [Chainlink Faucet](https://faucets.chain.link/arbitrum-sepolia)
- You need ~0.01 ETH for deployment

### 3. RPC Endpoint
You can use the public RPC or get a dedicated one:
- **Public**: `https://sepolia-rollup.arbitrum.io/rpc`
- **Alchemy**: Sign up at [Alchemy](https://www.alchemy.com/) for Arbitrum Sepolia
- **Infura**: Get endpoint from [Infura](https://infura.io/)

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Run Tests
```bash
npm test
```

### 4. Deploy to Arbitrum Sepolia
```bash
npm run deploy:arbitrum-sepolia
```

The deployment script will:
- ✅ Deploy MockUSDC contract for testing
- ✅ Deploy LiveLedger contract
- ✅ Mint 1000 test USDC tokens to your address
- ✅ Test basic functionality
- ✅ Provide contract addresses and configuration

### 5. Verify Contracts (Optional but Recommended)
After deployment, verify on Arbiscan:
```bash
# The script will show you the exact commands, but they'll look like:
npx hardhat verify --network arbitrumSepolia <MOCK_USDC_ADDRESS>
npx hardhat verify --network arbitrumSepolia <LIVE_LEDGER_ADDRESS>
```

## Expected Output

When deployment is successful, you'll see:
```
🚀 Deploying LiveLedger to Arbitrum Sepolia
==========================================

👤 Deployer: 0x1234...5678
🌐 Network: arbitrumSepolia
🔗 Chain ID: 421614
💰 Deployer Balance: 0.05 ETH

📦 Deploying MockUSDC contract...
✅ MockUSDC deployed successfully!
📋 MockUSDC Address: 0xabcd...efgh

📦 Deploying LiveLedger contract...
✅ LiveLedger deployed successfully!
📋 LiveLedger Address: 0x9876...5432

🧪 Testing basic contract functionality...
✅ MockUSDC name: Mock USDC
🪙 Minting test USDC tokens...
✅ Minted 1000 test USDC to deployer

🎉 Deployment Complete!
```

## Post-Deployment

### 1. Update Backend Environment
Add these to your backend `.env`:
```bash
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
LIVE_LEDGER_CONTRACT_ADDRESS=<deployed_address>
MOCK_USDC_ADDRESS=<deployed_address>
```

### 2. Update Frontend Configuration
Add these to your frontend:
```typescript
const LIVE_LEDGER_ADDRESS = "<deployed_address>";
const MOCK_USDC_ADDRESS = "<deployed_address>";
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
```

### 3. Start Testing
- Create test streams
- Test withdrawals
- Verify real-time calculations
- Test with multiple users

## Troubleshooting

### "Insufficient funds" Error
- Make sure you have enough ETH for gas fees
- Get more from [Arbitrum Sepolia Faucet](https://faucet.arbitrum.io/)

### "Invalid private key" Error
- Make sure private key is in `.env` without `0x` prefix
- Private key should be 64 characters long

### "Network connection" Error
- Check your RPC URL is correct
- Try a different RPC provider
- Check your internet connection

### "Contract verification failed"
- Wait a few minutes after deployment
- Make sure contract is deployed successfully
- Try verification again

## Next Steps After Deployment

1. **Update Contract Addresses**: Update both frontend and backend with deployed addresses
2. **Test Stream Creation**: Create a test payment stream
3. **Verify Real-time Updates**: Check that balances update in real-time
4. **Test Withdrawals**: Test the withdrawal functionality with daily limits
5. **Multi-user Testing**: Test with different wallet addresses
6. **Monitor Events**: Check that blockchain events are being captured

## Contract Addresses

After deployment, your contract addresses will be displayed. Save these:

- **LiveLedger Contract**: `<will be shown after deployment>`
- **MockUSDC Contract**: `<will be shown after deployment>`
- **Deployer Address**: `<your wallet address>`

## Security Notes

⚠️ **Testnet Only**: These contracts are deployed on testnet for testing purposes only.

🔒 **Private Key Security**: Never commit your private key to version control.

💰 **Test Tokens**: MockUSDC tokens have no real value and are for testing only.

🚀 **Ready for Production**: Once tested, use the production deployment script for mainnet.