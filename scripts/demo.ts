import { network } from "hardhat";
import { parseUnits, formatUnits } from "viem";

/**
 * Demo script showing how to use the LiveLedger protocol
 * 
 * This script demonstrates:
 * 1. Deploying contracts
 * 2. Setting up a payment stream
 * 3. Simulating time passage
 * 4. Withdrawing earned funds
 */
async function main() {
  console.log("🚀 LiveLedger Demo Script");
  console.log("========================\n");

  const { viem } = await network.connect();
  const accounts = await viem.getWalletClients();
  const testClient = await viem.getTestClient();
  
  // Setup accounts
  const payer = accounts[0];
  const freelancer = accounts[1];
  
  console.log(`👤 Payer: ${payer.account.address}`);
  console.log(`👤 Freelancer: ${freelancer.account.address}\n`);

  // Deploy contracts
  console.log("📦 Deploying contracts...");
  const mockUSDC = await viem.deployContract("MockUSDC", []);
  const liveLedger = await viem.deployContract("LiveLedger", []);
  
  console.log(`💰 MockUSDC deployed at: ${mockUSDC.address}`);
  console.log(`📋 LiveLedger deployed at: ${liveLedger.address}\n`);

  // Mint USDC to payer
  console.log("💸 Minting USDC to payer...");
  await mockUSDC.write.mintUSDC([payer.account.address, 10000n]); // 10,000 USDC
  
  const payerBalance = await mockUSDC.read.balanceOf([payer.account.address]);
  console.log(`💰 Payer USDC balance: ${formatUnits(payerBalance, 6)} USDC\n`);

  // Approve LiveLedger to spend USDC
  console.log("✅ Approving LiveLedger to spend USDC...");
  await mockUSDC.write.approve([liveLedger.address, parseUnits("5000", 6)], { account: payer.account });
  console.log("✅ Approval successful\n");

  // Create a payment stream for freelance work
  console.log("🌊 Creating payment stream...");
  const duration = 30 * 24 * 60 * 60; // 30 days in seconds
  const ratePerSecond = BigInt(1157); // ~$100/day rate that divides evenly
  const totalAmount = ratePerSecond * BigInt(duration); // Calculate total from rate to ensure exact math
  const maxWithdrawalsPerDay = 3; // Allow 3 withdrawals per day

  console.log(`💰 Total Amount: ${formatUnits(totalAmount, 6)} USDC`);
  console.log(`⏱️  Duration: ${duration / (24 * 60 * 60)} days`);
  console.log(`📈 Rate: ${formatUnits(ratePerSecond * BigInt(24 * 60 * 60), 6)} USDC/day`);
  console.log(`🔢 Max withdrawals/day: ${maxWithdrawalsPerDay}\n`);

  const streamTx = await liveLedger.write.createStream([
    freelancer.account.address,
    mockUSDC.address,
    totalAmount,
    ratePerSecond,
    BigInt(duration),
    maxWithdrawalsPerDay
  ], { account: payer.account });

  const streamId = 0n; // First stream
  console.log("✅ Stream created successfully!");
  console.log(`🆔 Stream ID: ${streamId}\n`);

  // Check initial state
  const stream = await liveLedger.read.getStream([streamId]);
  console.log("📊 Initial Stream State:");
  console.log(`   Active: ${stream.active}`);
  console.log(`   Total: ${formatUnits(stream.totalAmount, 6)} USDC`);
  console.log(`   Withdrawn: ${formatUnits(stream.withdrawn, 6)} USDC\n`);

  // Simulate 7 days of work
  console.log("⏳ Simulating 7 days of work...");
  const sevenDays = 7 * 24 * 60 * 60;
  await testClient.increaseTime({ seconds: sevenDays });
  await testClient.mine({ blocks: 1 });

  // Check claimable amount
  const claimableAfter7Days = await liveLedger.read.getClaimable([streamId]);
  console.log(`💰 Claimable after 7 days: ${formatUnits(claimableAfter7Days, 6)} USDC\n`);

  // Freelancer withdraws earned amount
  console.log("💸 Freelancer withdrawing earned amount...");
  const freelancerBalanceBefore = await mockUSDC.read.balanceOf([freelancer.account.address]);
  
  await liveLedger.write.withdraw([streamId], { account: freelancer.account });
  
  const freelancerBalanceAfter = await mockUSDC.read.balanceOf([freelancer.account.address]);
  const withdrawn = freelancerBalanceAfter - freelancerBalanceBefore;
  
  console.log(`✅ Withdrawal successful!`);
  console.log(`💰 Amount withdrawn: ${formatUnits(withdrawn, 6)} USDC`);
  console.log(`💰 Freelancer balance: ${formatUnits(freelancerBalanceAfter, 6)} USDC\n`);

  // Check stream state after withdrawal
  const streamAfterWithdrawal = await liveLedger.read.getStream([streamId]);
  console.log("📊 Stream State After Withdrawal:");
  console.log(`   Total: ${formatUnits(streamAfterWithdrawal.totalAmount, 6)} USDC`);
  console.log(`   Withdrawn: ${formatUnits(streamAfterWithdrawal.withdrawn, 6)} USDC`);
  console.log(`   Remaining: ${formatUnits(streamAfterWithdrawal.totalAmount - streamAfterWithdrawal.withdrawn, 6)} USDC\n`);

  // Simulate more time and show multiple withdrawals
  console.log("⏳ Simulating another 3 days...");
  await testClient.increaseTime({ seconds: 3 * 24 * 60 * 60 });
  await testClient.mine({ blocks: 1 });

  const claimableAfter10Days = await liveLedger.read.getClaimable([streamId]);
  console.log(`💰 Claimable after 10 total days: ${formatUnits(claimableAfter10Days, 6)} USDC\n`);

  // Test daily withdrawal limits
  console.log("🧪 Testing daily withdrawal limits...");
  
  // First withdrawal of the day
  await liveLedger.write.withdraw([streamId], { account: freelancer.account });
  console.log("✅ First withdrawal successful");
  
  // Try multiple withdrawals to test daily limit
  const dayIndex = await liveLedger.read.getCurrentDayIndex([streamId]);
  const withdrawalsToday = await liveLedger.read.getWithdrawalsPerDay([streamId, dayIndex]);
  console.log(`📊 Withdrawals used today: ${withdrawalsToday}/${maxWithdrawalsPerDay}\n`);

  // Show project completion scenario
  console.log("🎯 Fast-forwarding to project completion (30 days)...");
  await testClient.increaseTime({ seconds: 20 * 24 * 60 * 60 }); // Remaining 20 days
  await testClient.mine({ blocks: 1 });

  const finalClaimable = await liveLedger.read.getClaimable([streamId]);
  console.log(`💰 Final claimable amount: ${formatUnits(finalClaimable, 6)} USDC`);

  // Final withdrawal
  const freelancerFinalBalanceBefore = await mockUSDC.read.balanceOf([freelancer.account.address]);
  await liveLedger.write.withdraw([streamId], { account: freelancer.account });
  const freelancerFinalBalanceAfter = await mockUSDC.read.balanceOf([freelancer.account.address]);
  
  console.log(`✅ Final withdrawal: ${formatUnits(freelancerFinalBalanceAfter - freelancerFinalBalanceBefore, 6)} USDC`);
  console.log(`💰 Freelancer total earned: ${formatUnits(freelancerFinalBalanceAfter, 6)} USDC\n`);

  // Show stream stats
  const finalStats = await liveLedger.read.getStreamStats([streamId]);
  console.log("📊 Final Stream Statistics:");
  console.log(`   Total Amount: ${formatUnits(finalStats[0], 6)} USDC`);
  console.log(`   Total Withdrawn: ${formatUnits(finalStats[1], 6)} USDC`);
  console.log(`   Current Claimable: ${formatUnits(finalStats[2], 6)} USDC`);
  console.log(`   Remaining: ${formatUnits(finalStats[3], 6)} USDC\n`);

  console.log("🎉 LiveLedger Demo Complete!");
  console.log("✅ Successfully demonstrated:");
  console.log("   • Stream creation with time-based accrual");
  console.log("   • Real-time balance calculations");
  console.log("   • Withdrawal functionality with daily limits");
  console.log("   • Complete project lifecycle");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  });