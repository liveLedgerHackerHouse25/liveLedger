import { network } from "hardhat";
import { formatEther } from "viem";

/**
 * Deploy only LiveLedger contract since MockUSDC is already deployed
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

  // Check current nonce
  const nonce = await publicClient.getTransactionCount({ 
    address: deployer.account.address 
  });
  const pendingNonce = await publicClient.getTransactionCount({ 
    address: deployer.account.address,
    blockTag: 'pending'
  });
  
  console.log(`🔢 Current Nonce: ${nonce}`);
  console.log(`⏳ Pending Nonce: ${pendingNonce}\n`);

  if (nonce !== pendingNonce) {
    console.log(`⚠️  Warning: ${pendingNonce - nonce} pending transactions detected`);
    console.log("   Waiting for transactions to clear...\n");
    return;
  }

  // Deploy the main LiveLedger contract
  console.log("📦 Deploying LiveLedger contract...");
  console.log("🔄 This may take a moment on testnet...");
  
  try {
    const liveLedger = await viem.deployContract("LiveLedger", []);
    console.log(`✅ LiveLedger deployed successfully!`);
    console.log(`📋 LiveLedger Address: ${liveLedger.address}\n`);

    // Display deployment summary
    console.log("📝 Deployment Summary:");
    console.log("======================");
    console.log(`Network: Arbitrum Sepolia (421614)`);
    console.log(`Deployer: ${deployer.account.address}`);
    console.log(`MockUSDC: 0xf6f61a82856981fe317df8c7e078332616b081ec (already deployed)`);
    console.log(`LiveLedger: ${liveLedger.address}\n`);

    // Environment variables for backend
    console.log("🔧 Environment Variables:");
    console.log("=========================");
    console.log(`LIVE_LEDGER_CONTRACT_ADDRESS=${liveLedger.address}`);
    console.log(`MOCK_USDC_ADDRESS=0xf6f61a82856981fe317df8c7e078332616b081ec`);
    console.log(`DEPLOYER_ADDRESS=${deployer.account.address}\n`);

    // Frontend configuration
    console.log("🌐 Frontend Configuration:");
    console.log("==========================");
    console.log(`const LIVE_LEDGER_ADDRESS = "${liveLedger.address}";`);
    console.log(`const MOCK_USDC_ADDRESS = "0xf6f61a82856981fe317df8c7e078332616b081ec";`);
    console.log(`const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;\n`);

    // Verification commands
    console.log("📋 Verification Commands:");
    console.log("=========================");
    console.log(`npx hardhat verify --network arbitrumSepolia 0xf6f61a82856981fe317df8c7e078332616b081ec`);
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
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });