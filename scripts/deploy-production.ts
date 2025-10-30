import { network } from "hardhat";

/**
 * Production deployment script for LiveLedger
 * 
 * This script deploys only the LiveLedger contract (no test tokens)
 * for production environments where real USDC will be used.
 */
async function main() {
  console.log("🚀 Deploying LiveLedger to Production");
  console.log("===================================\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  
  console.log(`👤 Deployer: ${deployer.account.address}\n`);

  // Deploy only the main LiveLedger contract
  console.log("📦 Deploying LiveLedger contract...");
  const liveLedger = await viem.deployContract("LiveLedger", []);
  
  console.log(`✅ LiveLedger deployed successfully!`);
  console.log(`📋 Contract Address: ${liveLedger.address}\n`);

  // Display important information
  console.log("📝 Deployment Summary:");
  console.log("======================");
  console.log(`Contract: LiveLedger`);
  console.log(`Address: ${liveLedger.address}`);
  console.log(`Deployer: ${deployer.account.address}`);
  
  console.log("\n🔧 Next Steps:");
  console.log("===============");
  console.log("1. Verify the contract on block explorer");
  console.log("2. Set up frontend with the contract address");
  console.log("3. Configure supported tokens (USDC, DAI, etc.)");
  console.log("4. Test with small amounts before production use");
  
  console.log("\n📋 Verification Command:");
  console.log(`npx hardhat verify --network <NETWORK_NAME> ${liveLedger.address}`);

  console.log("\n🎉 Deployment Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });