import type { HardhatUserConfig } from "hardhat/config";
import { config as dotenvConfig } from "dotenv";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

// Load environment variables from .env file
dotenvConfig();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    arbitrumSepolia: {
      type: "http",
      chainType: "op",
      url: configVariable("ARBITRUM_SEPOLIA_RPC_URL"),
      accounts: [configVariable("ARBITRUM_PRIVATE_KEY")],
      chainId: 421614,
    },
    // Mainnet Networks
    mainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("ETHEREUM_MAINNET_RPC_URL"),
      accounts: [configVariable("MAINNET_PRIVATE_KEY")],
      chainId: 1,
      gasPrice: "auto",
    },
    arbitrumOne: {
      type: "http",
      chainType: "op",
      url: configVariable("ARBITRUM_ONE_RPC_URL"),
      accounts: [configVariable("MAINNET_PRIVATE_KEY")],
      chainId: 42161,
    },
    polygon: {
      type: "http",
      chainType: "l1", 
      url: configVariable("POLYGON_RPC_URL"),
      accounts: [configVariable("MAINNET_PRIVATE_KEY")],
      chainId: 137,
    },
  },
};

export default config;
