import { network } from "hardhat";
import { config as dotenvConfig } from "dotenv";

// Load environment variables
dotenvConfig();

/**
 * 🔍 Pre-Deployment Checklist for Arbitrum Mainnet
 * 
 * Run this before deploying to mainnet to verify all requirements
 */
async function main() {
  console.log("🔍 LiveLedger Pre-Deployment Checklist");
  console.log("=====================================\n");

  let allChecks = true;

  // Check 1: Environment Variables
  console.log("1️⃣ Checking Environment Variables...");
  
  const arbitrumRpcUrl = process.env.ARBITRUM_ONE_RPC_URL;
  const privateKey = process.env.MAINNET_PRIVATE_KEY;
  
  if (!arbitrumRpcUrl || arbitrumRpcUrl.includes("YOUR_ALCHEMY_API_KEY_HERE")) {
    console.log("❌ ARBITRUM_ONE_RPC_URL not configured properly");
    console.log("   Please set your Alchemy API key in .env file");
    allChecks = false;
  } else {
    console.log("✅ Arbitrum RPC URL configured");
  }
  
  if (!privateKey || privateKey.includes("YOUR_SECURE_MAINNET_PRIVATE_KEY_HERE")) {
    console.log("❌ MAINNET_PRIVATE_KEY not configured");
    console.log("   Please set your mainnet private key in .env file");
    allChecks = false;
  } else if (privateKey === "740ee8b50ed708f9efa9556d1c00a014ce8c795fff9786ae066bd22dcf7f0acb") {
    console.log("❌ You're using the testnet private key for mainnet!");
    console.log("   This is dangerous! Please use a secure mainnet private key");
    allChecks = false;
  } else {
    console.log("✅ Mainnet private key configured");
  }

  // Check 2: Network Connection
  console.log("\n2️⃣ Testing Network Connection...");
  try {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const chainId = await publicClient.getChainId();
    
    if (chainId === 42161) {
      console.log("✅ Connected to Arbitrum One");
    } else {
      console.log(`❌ Wrong network! Chain ID: ${chainId} (expected: 42161)`);
      allChecks = false;
    }
  } catch (error) {
    console.log("❌ Network connection failed:", error);
    allChecks = false;
  }

  // Check 3: Wallet Balance
  console.log("\n3️⃣ Checking Wallet Balance...");
  try {
    const { viem } = await network.connect();
    const [deployer] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();
    
    const balance = await publicClient.getBalance({ address: deployer.account.address });
    const balanceInEth = Number(balance) / 10**18;
    
    console.log(`💰 Address: ${deployer.account.address}`);
    console.log(`💰 Balance: ${balanceInEth.toFixed(6)} ETH`);
    
    if (balanceInEth < 0.001) {
      console.log("❌ Insufficient balance! Need at least 0.001 ETH for gas");
      allChecks = false;
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
  } catch (error) {
    console.log("❌ Could not check wallet balance:", error);
    allChecks = false;
  }

  // Check 4: Basic Setup
  console.log("\n4️⃣ Checking Basic Setup...");
  console.log("✅ Environment and network checks completed");
  console.log("   Make sure to run 'npx hardhat compile' before deployment");

  // Final Result
  console.log("\n" + "=".repeat(50));
  if (allChecks) {
    console.log("🎉 ALL CHECKS PASSED! Ready for mainnet deployment!");
    console.log("\n🚀 To deploy, run:");
    console.log("npx hardhat run scripts/deploy-arbitrum-mainnet.ts --network arbitrumOne");
  } else {
    console.log("❌ SOME CHECKS FAILED! Please fix the issues above before deploying.");
  }
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Checklist failed:", error);
    process.exit(1);
  });