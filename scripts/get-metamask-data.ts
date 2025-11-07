import hre from "hardhat";
import fs from "fs";
import path from "path";
import { execSync } from 'child_process';

/**
 * 🦊 MetaMask Gas Estimation Helper
 * 
 * This script gets the exact bytecode and gas estimation for LiveLedger deployment
 * Use this data in the MetaMask helper HTML page for accurate cost calculation
 */
async function getDeploymentData() {
  console.log("🔍 Getting LiveLedger deployment data for MetaMask...\n");

  try {
    // Get the compiled contract artifact (contracts should already be compiled)
    console.log("📦 Reading compiled contract artifact...");
    
    const contractPath = path.join(
      process.cwd(),
      "artifacts/contracts/LiveLedger.sol/LiveLedger.json"
    );

    if (!fs.existsSync(contractPath)) {
      console.log("⚠️  Contract not compiled. Compiling now...");
      // Run compilation manually
      execSync('npx hardhat compile', { stdio: 'inherit' });
    }

    const artifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const bytecode = artifact.bytecode;

    console.log("✅ Contract bytecode obtained");
    console.log(`📏 Bytecode size: ${bytecode.length} characters`);

    // Connect to Arbitrum One for gas estimation
    const { viem } = await hre.network.connect();
    const publicClient = await viem.getPublicClient();

    // Get current network info
    const chainId = await publicClient.getChainId();
    const gasPrice = await publicClient.getGasPrice();
    const gasPriceGwei = Number(gasPrice) / 10**9;

    console.log(`🌐 Connected to Chain ID: ${chainId}`);
    console.log(`⛽ Current Gas Price: ${gasPriceGwei.toFixed(4)} Gwei`);

    // Estimate gas for deployment
    try {
      // Try to estimate gas by simulating deployment using viem
      const estimatedGas = await publicClient.estimateGas({
        data: bytecode as `0x${string}`,
      });

      console.log(`📊 Estimated Gas: ${estimatedGas.toLocaleString()} gas`);

      // Calculate costs
      const deploymentCostWei = gasPrice * estimatedGas;
      const deploymentCostEth = Number(deploymentCostWei) / 10**18;
      const estimatedEthPrice = 3000; // Mock price - in real app fetch from API
      const deploymentCostUSD = deploymentCostEth * estimatedEthPrice;

      console.log("\n💰 Deployment Cost Estimation:");
      console.log("================================");
      console.log(`Gas Limit: ${estimatedGas.toLocaleString()} gas`);
      console.log(`Gas Price: ${gasPriceGwei.toFixed(4)} Gwei`);
      console.log(`Cost: ${deploymentCostEth.toFixed(6)} ETH`);
      console.log(`Cost: ~$${deploymentCostUSD.toFixed(2)} USD`);

      // Generate data for MetaMask helper
      const metamaskData = {
        contractName: "LiveLedger",
        bytecode: bytecode,
        abi: artifact.abi,
        estimatedGas: estimatedGas.toString(),
        currentGasPrice: gasPrice.toString(),
        currentGasPriceGwei: gasPriceGwei.toFixed(4),
        estimatedCostEth: deploymentCostEth.toFixed(6),
        estimatedCostUSD: deploymentCostUSD.toFixed(2),
        chainId: chainId,
        timestamp: new Date().toISOString()
      };

      // Save data for MetaMask helper
      const dataPath = path.join(__dirname, "metamask-deployment-data.json");
      fs.writeFileSync(dataPath, JSON.stringify(metamaskData, null, 2));

      console.log(`\n📄 MetaMask data saved to: ${dataPath}`);

      // Update the HTML file with the bytecode
      const htmlPath = path.join(__dirname, "metamask-deployment-helper.html");
      if (fs.existsSync(htmlPath)) {
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Replace the placeholder bytecode
        htmlContent = htmlContent.replace(
          'const LIVELEDGER_BYTECODE = "0x608060405234801561001057600080fd5b50..."; // Placeholder',
          `const LIVELEDGER_BYTECODE = "${bytecode}";`
        );

        // Add the estimated gas as well
        htmlContent = htmlContent.replace(
          'const estimatedGasLimit = 3500000; // Typical for complex contracts',
          `const estimatedGasLimit = ${estimatedGas}; // Actual estimated gas`
        );

        fs.writeFileSync(htmlPath, htmlContent);
        console.log("📝 Updated MetaMask helper HTML with actual bytecode and gas estimate");
      }

      console.log("\n🦊 MetaMask Integration Ready!");
      console.log("==============================");
      console.log("1. Open the MetaMask helper HTML file in your browser");
      console.log("2. Connect your MetaMask wallet");
      console.log("3. Switch to Arbitrum One network");
      console.log("4. Get exact gas estimation");
      console.log("5. Fund your wallet if needed");
      console.log("\n💡 After funding, run the deployment script:");
      console.log("npx hardhat run scripts/deploy-arbitrum-mainnet.ts --network arbitrumOne");

    } catch (gasEstimationError) {
      console.log("⚠️  Could not get exact gas estimation from network");
      console.log("Using typical deployment gas estimate: 3,500,000 gas");
      
      const fallbackGasLimit = 3500000n;
      const fallbackCostWei = gasPrice * fallbackGasLimit;
      const fallbackCostEth = Number(fallbackCostWei) / 10**18;
      const fallbackCostUSD = fallbackCostEth * 3000;

      console.log("\n💰 Fallback Cost Estimation:");
      console.log("=============================");
      console.log(`Gas Limit: ${fallbackGasLimit.toLocaleString()} gas (estimated)`);
      console.log(`Gas Price: ${gasPriceGwei.toFixed(4)} Gwei`);
      console.log(`Cost: ${fallbackCostEth.toFixed(6)} ETH`);
      console.log(`Cost: ~$${fallbackCostUSD.toFixed(2)} USD`);
    }

  } catch (error) {
    console.error("❌ Error getting deployment data:", error);
    throw error;
  }
}

// Instructions for opening MetaMask helper
function printInstructions() {
  console.log("\n📖 How to Use MetaMask Helper:");
  console.log("==============================");
  console.log("1. Open scripts/metamask-deployment-helper.html in your browser");
  console.log("2. Connect your MetaMask wallet");
  console.log("3. Make sure you're on Arbitrum One network");
  console.log("4. Click 'Get Exact Gas Estimate'");
  console.log("5. Fund your wallet if balance is insufficient");
  console.log("6. Copy your wallet address for .env file");
  console.log("\n🔧 To open the helper:");
  console.log("open scripts/metamask-deployment-helper.html");
  console.log("\nOr manually open the file in your web browser");
}

getDeploymentData()
  .then(() => {
    printInstructions();
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });