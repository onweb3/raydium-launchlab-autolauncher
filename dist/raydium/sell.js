"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sell = sell;
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const bn_js_1 = __importDefault(require("bn.js"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const raydium_1 = require("./raydium");
const constant_1 = require("../constant");
async function sell(tokenAddress, sellAmount, feeReceiver) {
    const raydium = await (0, raydium_1.initSdk)();
    const mintA = tokenAddress;
    const mintB = spl_token_1.NATIVE_MINT;
    const programId = constant_1.PROGRAM_ID;
    const poolId = (0, raydium_sdk_v2_1.getPdaLaunchpadPoolId)(programId, mintA, mintB).publicKey;
    const poolInfo = await raydium.launchpad.getRpcPoolInfo({ poolId });
    const data = await raydium.connection.getAccountInfo(poolInfo.platformId);
    const platformInfo = raydium_sdk_v2_1.PlatformConfig.decode(data.data);
    const inAmount = sellAmount;
    const mintInfo = await raydium.token.getTokenInfo(mintA);
    const epochInfo = await raydium.connection.getEpochInfo();
    const res = raydium_sdk_v2_1.Curve.sellExactIn({
        poolInfo,
        amountA: inAmount,
        protocolFeeRate: poolInfo.configInfo.tradeFeeRate,
        platformFeeRate: platformInfo.feeRate,
        curveType: poolInfo.configInfo.curveType,
        shareFeeRate: poolInfo.configInfo.maxShareFeeRate,
        creatorFeeRate: platformInfo.creatorFeeRate,
        slot: await raydium.connection.getSlot(),
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
    const { execute, transaction, builder } = await raydium.launchpad.sellToken({
        programId,
        mintA,
        mintAProgram: new web3_js_1.PublicKey(mintInfo.programId),
        poolInfo,
        configInfo: poolInfo.configInfo,
        platformFeeRate: platformInfo.feeRate,
        txVersion: raydium_sdk_v2_1.TxVersion.V0,
        sellAmount: inAmount,
        shareFeeReceiver: feeReceiver,
        shareFeeRate: poolInfo.configInfo.maxShareFeeRate,
        slippage: new bn_js_1.default(constant_1.SLIPPAGE)
    });
    return {
        execute,
        transaction,
        builder
    };
}
