"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMint = createMint;
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const bn_js_1 = __importDefault(require("bn.js"));
const spl_token_1 = require("@solana/spl-token");
const raydium_1 = require("./raydium");
const constant_1 = require("../constant");
async function createMint(pair, buyAmount, name, symbol, metadata, feeReceiver) {
    const raydium = await (0, raydium_1.initSdk)();
    const programId = constant_1.PROGRAM_ID;
    const mintA = pair.publicKey;
    const configId = (0, raydium_sdk_v2_1.getPdaLaunchpadConfigId)(programId, spl_token_1.NATIVE_MINT, 0, 0).publicKey;
    const configData = await raydium.connection.getAccountInfo(configId);
    if (!configData)
        throw new Error('config not found');
    const configInfo = raydium_sdk_v2_1.LaunchpadConfig.decode(configData.data);
    const mintBInfo = await raydium.token.getTokenInfo(configInfo.mintB);
    const inAmount = buyAmount;
    const { execute, transactions, extInfo } = await raydium.launchpad.createLaunchpad({
        programId,
        mintA,
        decimals: 6,
        name: name,
        symbol: symbol,
        migrateType: 'cpmm',
        uri: metadata,
        configId,
        configInfo,
        mintBDecimals: mintBInfo.decimals,
        platformId: constant_1.CPCONFIG,
        txVersion: constant_1.txVersion,
        slippage: new bn_js_1.default(constant_1.SLIPPAGE),
        buyAmount: inAmount,
        createOnly: false,
        extraSigners: [pair],
        creatorFeeOn: raydium_sdk_v2_1.CpmmCreatorFeeOn.OnlyTokenB,
        computeBudgetConfig: {
            units: 600000,
            microLamports: 46591500,
        },
    });
    (0, raydium_sdk_v2_1.printSimulate)(transactions);
    return {
        execute,
        transactions,
        extInfo
    };
}
