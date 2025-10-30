import { network } from "hardhat";
import { formatEther } from "viem";

/**
 * Local deployment script for LiveLedger
 * 
 * This script deploys both LiveLedger and MockUSDC contracts
 * to the local hardhat network for testing.
 */
async function main() {
  console.log("🚀 Deploying LiveLedger to Local Network");
  console.log("========================================\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log(`👤 Deployer: ${deployer.account.address}`);
  console.log(`🌐 Network: ${network.name}`);

  // Check deployer balance
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log(`💰 Deployer Balance: ${formatEther(balance)} ETH\n`);

  // Deploy MockUSDC first (for testing)
  console.log("📦 Deploying MockUSDC contract...");
  const mockUSDC = await viem.deployContract("MockUSDC", []);
  console.log(`✅ MockUSDC deployed successfully!`);
  console.log(`📋 MockUSDC Address: ${mockUSDC.address}\n`);

  // Deploy the main LiveLedger contract
  console.log("📦 Deploying LiveLedger contract...");
  const liveLedger = await viem.deployContract("LiveLedger", []);
  console.log(`✅ LiveLedger deployed successfully!`);
  console.log(`📋 LiveLedger Address: ${liveLedger.address}\n`);

  console.log("✅ Both contracts deployed successfully!\n");

  // Display deployment summary
  console.log("📝 Deployment Summary:");
  console.log("======================");
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.account.address}`);
  console.log(`MockUSDC: ${mockUSDC.address}`);
  console.log(`LiveLedger: ${liveLedger.address}\n`);

  // Environment variables for backend
  console.log("🔧 Environment Variables for Testing:");
  console.log("=====================================");
  console.log(`NETWORK_RPC_URL=http://127.0.0.1:8545`);
  console.log(`LIVE_LEDGER_CONTRACT_ADDRESS=${liveLedger.address}`);
  console.log(`MOCK_USDC_ADDRESS=${mockUSDC.address}`);
  console.log(`DEPLOYER_ADDRESS=${deployer.account.address}\n`);

  // Next steps
  console.log("🔧 Next Steps:");
  console.log("===============");
  console.log("1. Update your backend .env with the addresses above");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Test stream creation and withdrawals locally");
  console.log("4. Once working, deploy to testnet");
  
  console.log("\n🎉 Local Deployment Complete!");
  console.log("Ready for local testing! 🚀");
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });