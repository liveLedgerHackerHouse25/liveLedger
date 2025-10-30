import { network } from "hardhat";

async function main() {
  console.log("🔍 Checking Account Nonce on Arbitrum Sepolia");
  console.log("=============================================\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log(`📍 Account: ${deployer.account.address}`);
  
  // Get current nonce
  const nonce = await publicClient.getTransactionCount({ 
    address: deployer.account.address 
  });
  
  // Get pending nonce
  const pendingNonce = await publicClient.getTransactionCount({ 
    address: deployer.account.address,
    blockTag: 'pending'
  });
  
  console.log(`🔢 Current Nonce: ${nonce}`);
  console.log(`⏳ Pending Nonce: ${pendingNonce}`);
  
  if (nonce !== pendingNonce) {
    console.log(`⚠️  Warning: There are ${pendingNonce - nonce} pending transactions`);
    console.log("   Wait for them to complete before deploying");
  } else {
    console.log("✅ No pending transactions - ready to deploy!");
  }
  
  // Get account balance
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log(`💰 Balance: ${Number(balance) / 1e18} ETH\n`);
  
  console.log("🔧 Next nonce to use:", pendingNonce);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });