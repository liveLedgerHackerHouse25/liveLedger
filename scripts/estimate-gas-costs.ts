import hre from "hardhat";

/**
 * 💰 Gas Cost Estimation for LiveLedger Deployment on Arbitrum
 * 
 * Run this to estimate deployment costs before actually deploying
 */
async function main() {
  console.log("💰 LiveLedger Deployment Cost Estimation");
  console.log("========================================\n");

  // Get network name from command line arguments
  const networkName = process.argv.includes('--network') 
    ? process.argv[process.argv.indexOf('--network') + 1]
    : process.env.HARDHAT_NETWORK || "hardhat";
    
  console.log(`🔍 Current network: ${networkName}`);
  
  if (networkName !== "arbitrumOne") {
    throw new Error(`❌ Wrong network! Expected 'arbitrumOne', got '${networkName}'\n` +
                   `💡 Please run: npx hardhat run scripts/estimate-gas-costs.ts --network arbitrumOne`);
  }

  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log(`👤 Deployer: ${deployer.account.address}`);
  console.log(`🌐 Network: Arbitrum One (Chain ID: ${await publicClient.getChainId()})`);
  
  // Check deployer balance
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  const balanceInEth = Number(balance) / 10**18;
  console.log(`💰 Current Balance: ${balanceInEth.toFixed(6)} ETH\n`);
  
  // Get current gas price
  const gasPrice = await publicClient.getGasPrice();
  const gasPriceInGwei = Number(gasPrice) / 10**9;
  console.log(`⛽ Current Gas Price: ${gasPriceInGwei.toFixed(2)} Gwei`);
  
  // Estimate deployment gas (typical for complex contracts like LiveLedger)
  const estimatedGasLimits = {
    optimistic: 2500000n,    // Best case
    realistic: 3500000n,     // Most likely
    conservative: 4500000n   // Worst case
  };
  
  console.log("\n📊 Estimated Deployment Costs:");
  console.log("===============================");
  
  Object.entries(estimatedGasLimits).forEach(([scenario, gasLimit]) => {
    const costWei = gasPrice * gasLimit;
    const costEth = Number(costWei) / 10**18;
    const costUSD = costEth * 3000; // Rough ETH price estimate
    
    console.log(`${scenario.toUpperCase().padEnd(12)}: ${gasLimit.toLocaleString().padStart(10)} gas = ${costEth.toFixed(6)} ETH (~$${costUSD.toFixed(2)} USD)`);
  });
  
  // Safety recommendations
  const conservativeCost = Number(gasPrice * estimatedGasLimits.conservative) / 10**18;
  const recommendedBalance = conservativeCost * 2; // 2x buffer
  
  console.log("\n🛡️  Safety Recommendations:");
  console.log("===========================");
  console.log(`Minimum Balance: ${conservativeCost.toFixed(6)} ETH`);
  console.log(`Recommended:     ${recommendedBalance.toFixed(6)} ETH (2x buffer)`);
  console.log(`Your Balance:    ${balanceInEth.toFixed(6)} ETH`);
  
  if (balanceInEth < conservativeCost) {
    console.log("\n❌ INSUFFICIENT BALANCE!");
    console.log(`   You need at least ${conservativeCost.toFixed(6)} ETH to deploy safely.`);
    console.log(`   Current shortfall: ${(conservativeCost - balanceInEth).toFixed(6)} ETH`);
  } else if (balanceInEth < recommendedBalance) {
    console.log("\n⚠️  LOW BALANCE WARNING!");
    console.log(`   You have enough to deploy, but recommended buffer is ${recommendedBalance.toFixed(6)} ETH`);
    console.log("   Consider adding more ETH for safety.");
  } else {
    console.log("\n✅ BALANCE SUFFICIENT!");
    console.log("   You have enough ETH for safe deployment.");
  }
  
  console.log("\n💡 Cost Comparison:");
  console.log("==================");
  console.log(`Ethereum Mainnet: ~$50-200 USD (High gas fees)`);
  console.log(`Arbitrum One:     ~$${(Number(gasPrice * estimatedGasLimits.realistic) / 10**18 * 3000).toFixed(2)} USD (What you'll pay)`);
  console.log(`Polygon:          ~$0.01-0.10 USD (Cheapest option)`);
  
  console.log("\n🚀 Ready to deploy?");
  console.log("==================");
  console.log("Run: npx hardhat run scripts/deploy-arbitrum-mainnet.ts --network arbitrumOne");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Estimation failed:", error);
    process.exit(1);
  });