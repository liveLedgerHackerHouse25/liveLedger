import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LiveLedgerModule", (m) => {
  // Deploy MockUSDC token for testing
  const mockUSDC = m.contract("MockUSDC");

  // Deploy the main LiveLedger contract
  const liveLedger = m.contract("LiveLedger");

  return { 
    liveLedger,
    mockUSDC
  };
});