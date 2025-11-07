import hre from "hardhat";

/**
 * 🚀 LiveLedger Arbitrum Mainnet Deployment
 * 
 * This script deploys LiveLedger to Arbitrum mainnet using Alchemy RPC
 * Make sure you have:
 * 1. ARBITRUM_ONE_RPC_URL with your Alchemy API key
 * 2. MAINNET_PRIVATE_KEY with a funded wallet
 * 3. Enough ETH in your wallet for gas fees (~$2-5)
 */
async function main() {
  console.log("🚀 Deploying LiveLedger to Arbitrum Mainnet");
  console.log("===========================================\n");

  // Get network name from command line arguments
  const networkName = process.argv.includes('--network') 
    ? process.argv[process.argv.indexOf('--network') + 1]
    : process.env.HARDHAT_NETWORK || "hardhat";
    
  console.log(`🔍 Current network: ${networkName}`);
  
  if (networkName !== "arbitrumOne") {
    throw new Error(`❌ Wrong network! Expected 'arbitrumOne', got '${networkName}'\n` +
                   `💡 Please run: npx hardhat run scripts/deploy-arbitrum-mainnet.ts --network arbitrumOne`);
  }

  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log(`👤 Deployer: ${deployer.account.address}`);
  console.log(`🌐 Network: Arbitrum One (Chain ID: ${await publicClient.getChainId()})`);
  
  // Check deployer balance
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  const balanceInEth = Number(balance) / 10**18;
  console.log(`💰 Deployer Balance: ${balanceInEth.toFixed(6)} ETH`);
  
  // Get current gas price for cost estimation
  const gasPrice = await publicClient.getGasPrice();
  const gasPriceInGwei = Number(gasPrice) / 10**9;
  console.log(`⛽ Current Gas Price: ${gasPriceInGwei.toFixed(2)} Gwei`);
  
  // Estimate deployment cost
  const estimatedGasLimit = 3500000n; // Typical for complex contracts
  const estimatedCostWei = gasPrice * estimatedGasLimit;
  const estimatedCostEth = Number(estimatedCostWei) / 10**18;
  const estimatedCostUSD = estimatedCostEth * 3000; // Rough ETH price estimate
  
  console.log(`📊 Estimated Deployment Cost:`);
  console.log(`   Gas Limit: ~${estimatedGasLimit.toLocaleString()} gas`);
  console.log(`   Cost: ${estimatedCostEth.toFixed(6)} ETH (~$${estimatedCostUSD.toFixed(2)} USD)`);
  
  if (balanceInEth < estimatedCostEth * 1.5) {
    console.log(`⚠️  WARNING: Balance may be insufficient for deployment!`);
    console.log(`   Recommended: At least ${(estimatedCostEth * 1.5).toFixed(6)} ETH`);
  }
  
  if (balanceInEth < 0.001) {
    throw new Error("❌ Insufficient ETH balance! Need at least 0.001 ETH for gas fees.");
  }
  
  console.log("✅ Balance check passed\n");

  // Deploy LiveLedger contract
  console.log("📦 Deploying LiveLedger contract...");
  
  try {
    const liveLedger = await viem.deployContract("LiveLedger", []);
    
    console.log(`✅ LiveLedger deployed successfully!`);
    console.log(`📋 Contract Address: ${liveLedger.address}\n`);

    // Get transaction receipt for cost calculation
    console.log("⏳ Getting transaction details...");
    
    // Display deployment summary
    console.log("📝 Deployment Summary:");
    console.log("======================");
    console.log(`Contract: LiveLedger`);
    console.log(`Address: ${liveLedger.address}`);
    console.log(`Deployer: ${deployer.account.address}`);
    console.log(`Network: Arbitrum One`);
    console.log(`Explorer: https://arbiscan.io/address/${liveLedger.address}\n`);

    // Important next steps
    console.log("🔧 Next Steps:");
    console.log("===============");
    console.log("1. ✅ Verify contract on Arbiscan:");
    console.log(`   npx hardhat verify --network arbitrumOne ${liveLedger.address}`);
    console.log("2. 🔧 Update your frontend with the new contract address");
    console.log("3. 🧪 Test with small amounts first!");
    console.log("4. 📋 Update your .env file:");
    console.log(`   LIVE_LEDGER_CONTRACT_ADDRESS=${liveLedger.address}`);
    
    console.log("\n💡 Supported Tokens on Arbitrum:");
    console.log("=================================");
    console.log("USDC: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831");
    console.log("USDT: 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9");
    console.log("DAI:  0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1");

    console.log("\n🎉 Deployment Complete! Your LiveLedger is now live on Arbitrum! 🎉");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });