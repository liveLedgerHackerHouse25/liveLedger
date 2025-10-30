import { network } from "hardhat";
import { formatEther } from "viem";

/**
 * Arbitrum Sepolia deployment script for LiveLedger
 * 
 * This script deploys both LiveLedger and MockUSDC contracts
 * for testing on Arbitrum Sepolia testnet.
 */
async function main() {
  console.log("🚀 Deploying LiveLedger to Arbitrum Sepolia");
  console.log("==========================================\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log(`👤 Deployer: ${deployer.account.address}`);
  console.log(`🌐 Network: arbitrumSepolia`);
  console.log(`🔗 Chain ID: 421614\n`);

  // Check deployer balance
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log(`💰 Deployer Balance: ${formatEther(balance)} ETH\n`);

  // Check nonce status
  const latestNonce = await publicClient.getTransactionCount({ 
    address: deployer.account.address,
    blockTag: 'latest'
  });
  const pendingNonce = await publicClient.getTransactionCount({ 
    address: deployer.account.address,
    blockTag: 'pending'
  });
  
  console.log(`🔢 Latest nonce: ${latestNonce}`);
  console.log(`🔢 Pending nonce: ${pendingNonce}`);
  
  // Use the higher of the two nonces to ensure we don't have conflicts
  const correctNonce = Math.max(latestNonce, pendingNonce);
  console.log(`🎯 Using nonce: ${correctNonce}\n`);
  
  if (pendingNonce > latestNonce) {
    console.log(`⚠️  Warning: ${pendingNonce - latestNonce} pending transaction(s) detected`);
    console.log("⏳ Waiting a moment for transactions to settle...\n");
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    console.log("✅ No pending transactions\n");
  }

  try {
    // Deploy MockUSDC first (for testing)
    console.log("📦 Deploying MockUSDC contract...");
    console.log("🔄 This may take a moment on testnet...");
    const mockUSDC = await viem.deployContract("MockUSDC", []);
    console.log(`✅ MockUSDC deployed successfully!`);
    console.log(`📋 MockUSDC Address: ${mockUSDC.address}\n`);

    // Wait longer between deployments to ensure nonce synchronization
    console.log("⏳ Waiting for transaction confirmation and nonce sync...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify nonce has incremented properly
    const newNonce = await publicClient.getTransactionCount({ 
      address: deployer.account.address,
      blockTag: 'latest'
    });
    console.log(`🔢 Nonce after first deployment: ${newNonce}`);

    // Deploy the main LiveLedger contract
    console.log("📦 Deploying LiveLedger contract...");
    console.log("🔄 This may take a moment on testnet...");
    const liveLedger = await viem.deployContract("LiveLedger", []);
    console.log(`✅ LiveLedger deployed successfully!`);
    console.log(`📋 LiveLedger Address: ${liveLedger.address}\n`);

    console.log("✅ Both contracts deployed successfully!\n");

    // Display deployment summary
    console.log("📝 Deployment Summary:");
    console.log("======================");
    console.log(`Network: Arbitrum Sepolia (421614)`);
    console.log(`Deployer: ${deployer.account.address}`);
    console.log(`MockUSDC: ${mockUSDC.address}`);
    console.log(`LiveLedger: ${liveLedger.address}\n`);

    // Environment variables for backend
    console.log("🔧 Environment Variables:");
    console.log("=========================");
    console.log(`ARBITRUM_SEPOLIA_RPC_URL=<your_arbitrum_sepolia_rpc_url>`);
    console.log(`LIVE_LEDGER_CONTRACT_ADDRESS=${liveLedger.address}`);
    console.log(`MOCK_USDC_ADDRESS=${mockUSDC.address}`);
    console.log(`DEPLOYER_ADDRESS=${deployer.account.address}\n`);

    // Frontend configuration
    console.log("🌐 Frontend Configuration:");
    console.log("==========================");
    console.log(`const LIVE_LEDGER_ADDRESS = "${liveLedger.address}";`);
    console.log(`const MOCK_USDC_ADDRESS = "${mockUSDC.address}";`);
    console.log(`const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;\n`);

    // Verification commands
    console.log("📋 Verification Commands:");
    console.log("=========================");
    console.log(`npx hardhat verify --network arbitrumSepolia ${mockUSDC.address}`);
    console.log(`npx hardhat verify --network arbitrumSepolia ${liveLedger.address}\n`);

    // Next steps
    console.log("🔧 Next Steps:");
    console.log("===============");
    console.log("1. Add the environment variables to your .env file");
    console.log("2. Update frontend with contract addresses");
    console.log("3. Verify contracts on Arbiscan");
    console.log("4. Test stream creation and withdrawals");
    console.log("5. Start the real-time worker service");
    
    console.log("\n🎉 Deployment Complete!");
    console.log("Ready for testing on Arbitrum Sepolia! 🚀");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    // Check if this is a nonce error
    if (error instanceof Error && error.message && error.message.includes('nonce')) {
      console.log("\n🔧 Nonce Troubleshooting:");
      console.log("=========================");
      console.log("1. Wait a few minutes for pending transactions to clear");
      console.log("2. Check your wallet for any pending transactions");
      console.log("3. Try running the script again");
      
      // Get current nonce info for debugging
      try {
        const currentLatest = await publicClient.getTransactionCount({ 
          address: deployer.account.address,
          blockTag: 'latest'
        });
        const currentPending = await publicClient.getTransactionCount({ 
          address: deployer.account.address,
          blockTag: 'pending'
        });
        console.log(`\n📊 Current nonce status:`);
        console.log(`   Latest: ${currentLatest}`);
        console.log(`   Pending: ${currentPending}`);
      } catch (nonceError) {
        console.log("   Could not retrieve nonce information");
      }
    }
    
    throw error;
  }
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });