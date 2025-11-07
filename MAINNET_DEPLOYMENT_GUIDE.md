# 🚀 LiveLedger Mainnet Deployment Guide

## ⚠️ CRITICAL SECURITY CHECKLIST

### 1. Wallet & Private Key Security
- [ ] **NEVER** use test private keys for mainnet
- [ ] Generate a new, secure wallet specifically for deployment
- [ ] Fund the wallet with enough ETH for gas fees (~0.1-0.5 ETH)
- [ ] Store private key securely (hardware wallet recommended)
- [ ] Use environment variables, never commit keys to git

### 2. Network Configuration
- [ ] Configure mainnet RPC endpoint
- [ ] Set correct gas price and gas limit
- [ ] Verify network ID (1 for Ethereum mainnet)

### 3. Contract Security Review
- [ ] Complete security audit of smart contracts
- [ ] Test thoroughly on testnets first
- [ ] Verify all contract parameters
- [ ] Check for reentrancy and overflow vulnerabilities

### 4. Pre-Deployment Testing
- [ ] Deploy and test on Sepolia/Goerli testnet
- [ ] Test all contract functions
- [ ] Verify gas estimations
- [ ] Test with real token addresses (USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)

## 🔧 Required Environment Variables

Create a new `.env.mainnet` file:

```bash
# Ethereum Mainnet Configuration
ETHEREUM_MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
MAINNET_PRIVATE_KEY=YOUR_SECURE_PRIVATE_KEY

# Alternative Networks
ARBITRUM_ONE_RPC_URL=https://arb1.arbitrum.io/rpc
POLYGON_RPC_URL=https://polygon-rpc.com
```

## 📋 Deployment Networks to Consider

### Option 1: Ethereum Mainnet
- **Pros**: Maximum security, largest liquidity
- **Cons**: High gas fees (~$50-200 per deployment)
- **Best for**: High-value transactions

### Option 2: Arbitrum One (Recommended)
- **Pros**: Low gas fees, Ethereum security, good DeFi ecosystem
- **Cons**: Slightly less adoption than mainnet
- **Best for**: Most use cases

### Option 3: Polygon
- **Pros**: Very low fees, fast transactions
- **Cons**: Different security model
- **Best for**: High-frequency, low-value transactions

## 🚀 Deployment Steps

### Step 1: Update Hardhat Config
```typescript
networks: {
  mainnet: {
    url: process.env.ETHEREUM_MAINNET_RPC_URL,
    accounts: [process.env.MAINNET_PRIVATE_KEY],
    gasPrice: "auto",
    chainId: 1
  },
  arbitrumOne: {
    url: process.env.ARBITRUM_ONE_RPC_URL,
    accounts: [process.env.MAINNET_PRIVATE_KEY],
    chainId: 42161
  }
}
```

### Step 2: Deploy to Chosen Network
```bash
# For Ethereum Mainnet
npx hardhat run scripts/deploy-production.ts --network mainnet

# For Arbitrum One (Recommended)
npx hardhat run scripts/deploy-production.ts --network arbitrumOne
```

### Step 3: Verify Contract
```bash
npx hardhat verify --network arbitrumOne CONTRACT_ADDRESS
```

## 💰 Gas Fee Estimates

- **Ethereum Mainnet**: $50-200 USD
- **Arbitrum One**: $1-5 USD
- **Polygon**: $0.01-0.1 USD

## 🔍 Post-Deployment Checklist

- [ ] Verify contract on block explorer
- [ ] Test basic functions with small amounts
- [ ] Update frontend configuration
- [ ] Set up monitoring and alerts
- [ ] Document contract addresses
- [ ] Create emergency procedures

## 🛡️ Security Recommendations

1. **Start Small**: Begin with small test transactions
2. **Multi-sig**: Consider using multi-signature wallet for ownership
3. **Monitoring**: Set up alerts for unusual activity
4. **Upgrades**: Plan for contract upgrades if needed
5. **Insurance**: Consider smart contract insurance

## 📞 Emergency Contacts

- Smart Contract Security: [Your security team]
- DevOps: [Your DevOps team]
- Legal: [Your legal team]

---

**⚠️ Remember: Mainnet deployment is irreversible and involves real money. Double-check everything!**