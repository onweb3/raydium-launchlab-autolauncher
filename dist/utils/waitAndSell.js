"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitAndSell = waitAndSell;
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const bn_js_1 = __importDefault(require("bn.js"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const constant_1 = require("../constant");
const raydium_1 = require("../raydium/raydium");
const checkTokenBalance_1 = require("./checkTokenBalance");
const wait_1 = require("./wait");
async function waitAndSell(tokenAddress) {
    console.log('Initializing sell process...');
    await (0, wait_1.waitMs)(400);
    const raydium = await (0, raydium_1.initSdk)();
    const mintA = tokenAddress;
    const mintB = spl_token_1.NATIVE_MINT;
    const programId = constant_1.PROGRAM_ID;
    // Use retry logic to wait for token account
    console.log('Checking for token account...');
    const tokenBalance = await (0, checkTokenBalance_1.getTokenBalanceWithRetry)(raydium.connection, constant_1.OWNER.publicKey, mintA);
    const poolId = (0, raydium_sdk_v2_1.getPdaLaunchpadPoolId)(programId, mintA, mintB).publicKey;
    const poolInfo = await raydium.launchpad.getRpcPoolInfo({ poolId });
    const data = await raydium.connection.getAccountInfo(poolInfo.platformId);
    const platformInfo = raydium_sdk_v2_1.PlatformConfig.decode(data.data);
    await (0, wait_1.waitMs)(2000);
    const inAmount = tokenBalance;
    const mintInfo = await raydium.token.getTokenInfo(mintA);
    const epochInfo = await raydium.connection.getEpochInfo();
    const feeThreshold = Math.floor(constant_1.feeBalance * web3_js_1.LAMPORTS_PER_SOL);
    // Start 30-second loop
    const startTime = Date.now();
    const timeoutDuration = 30000; // 30 seconds
    let shouldSell = false;
    console.log(`Starting 30-second monitoring before selling on profit. min profit required: ${(feeThreshold / web3_js_1.LAMPORTS_PER_SOL).toFixed(4)} SOL\nIf profit criteria is not met then all the holdings will be sold`);
    while (Date.now() - startTime < timeoutDuration) {
        try {
            const currentSlot = await raydium.connection.getSlot();
            const res = raydium_sdk_v2_1.Curve.sellExactIn({
                poolInfo,
                amountA: new bn_js_1.default(inAmount),
                protocolFeeRate: poolInfo.configInfo.tradeFeeRate,
                platformFeeRate: platformInfo.feeRate,
                curveType: poolInfo.configInfo.curveType,
                shareFeeRate: poolInfo.configInfo.maxShareFeeRate,
                creatorFeeRate: platformInfo.creatorFeeRate,
                slot: currentSlot,
                transferFeeConfigA: mintInfo.extensions.feeConfig
                    ? {
                        transferFeeConfigAuthority: web3_js_1.PublicKey.default,
                        withdrawWithheldAuthority: web3_js_1.PublicKey.default,
                        withheldAmount: BigInt(0),
                        olderTransferFee: {
                            epoch: BigInt(mintInfo.extensions.feeConfig.olderTransferFee.epoch ?? epochInfo?.epoch ?? 0),
                            maximumFee: BigInt(mintInfo.extensions.feeConfig.olderTransferFee.maximumFee),
                            transferFeeBasisPoints: mintInfo.extensions.feeConfig.olderTransferFee.transferFeeBasisPoints,
                        },
                        newerTransferFee: {
                            epoch: BigInt(mintInfo.extensions.feeConfig.newerTransferFee.epoch ?? epochInfo?.epoch ?? 0),
                            maximumFee: BigInt(mintInfo.extensions.feeConfig.newerTransferFee.maximumFee),
                            transferFeeBasisPoints: mintInfo.extensions.feeConfig.newerTransferFee.transferFeeBasisPoints,
                        },
                    }
                    : undefined,
            });
            const expectedOutSol = Number(res.amountB.toString());
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[${elapsedTime}s] Expected out: ${expectedOutSol} lamports (${(expectedOutSol / web3_js_1.LAMPORTS_PER_SOL).toFixed(4)} SOL) | Threshold: ${feeThreshold} lamports (${(feeThreshold / web3_js_1.LAMPORTS_PER_SOL).toFixed(4)} SOL)`);
            // Check if expected amount is greater than fee threshold
            if (expectedOutSol > feeThreshold) {
                console.log(`✓ Expected amount exceeds fee threshold! Selling immediately...`);
                shouldSell = true;
                break;
            }
            // Wait 1 second before next check
            await new Promise(resolve => setTimeout(resolve, 400));
        }
        catch (error) {
            console.error('Error in monitoring loop:', error);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    // If timeout reached without exceeding threshold
    if (!shouldSell) {
        console.log(`30 seconds elapsed. Expected amount never exceeded threshold. Selling all tokens now...`);
    }
    // Execute sell transaction
    console.log('Executing sell transaction...');
    const { execute, transaction, builder } = await raydium.launchpad.sellToken({
        programId,
        mintA,
        mintAProgram: new web3_js_1.PublicKey(mintInfo.programId),
        poolInfo,
        configInfo: poolInfo.configInfo,
        platformFeeRate: platformInfo.feeRate,
        txVersion: raydium_sdk_v2_1.TxVersion.V0,
        sellAmount: new bn_js_1.default(inAmount),
        shareFeeReceiver: constant_1.FEE_RECIEVER,
        shareFeeRate: poolInfo.configInfo.maxShareFeeRate,
        slippage: new bn_js_1.default(constant_1.SLIPPAGE)
    });
    const txId = await execute();
    console.log('Sell transaction completed:', txId);
    return txId;
}
