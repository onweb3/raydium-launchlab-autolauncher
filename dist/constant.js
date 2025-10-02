"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintedFolder = exports.feeBalance = exports.API_URL = exports.tokensDir = exports.GATEWAY_URL = exports.tokenInfoCsv = exports.metadataDir = exports.imagePath = exports.SLIPPAGE = exports.buyAmount = exports.PINATA = exports.PROGRAM_ID = exports.CPCONFIG = exports.FEE_RECIEVER = exports.CLUSTER = exports.txVersion = exports.CONNECTION = exports.OWNER = void 0;
const web3_js_1 = require("@solana/web3.js");
const helper_1 = require("./utils/helper");
const bs58_1 = __importDefault(require("bs58"));
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const pinata_1 = require("pinata");
const path_1 = __importDefault(require("path"));
require("dotenv/config");
const CREATOR_KEY = (0, helper_1.requireEnv)("CREATOR_KEY");
if (!(0, helper_1.isValidBs58PrivateKey)(CREATOR_KEY)) {
    throw new Error("CREATOR_KEY must be a valid base58-encoded private key (64 bytes).");
}
const RPC_URL = (0, helper_1.requireEnv)("RPC_URL");
if (!(0, helper_1.isValidUrl)(RPC_URL)) {
    throw new Error(" RPC_URL must be a valid HTTP/HTTPS URL.");
}
const OWNER = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(CREATOR_KEY));
exports.OWNER = OWNER;
const CONNECTION = new web3_js_1.Connection(RPC_URL);
exports.CONNECTION = CONNECTION;
const txVersion = raydium_sdk_v2_1.TxVersion.V0;
exports.txVersion = txVersion;
const CLUSTER = (0, helper_1.requireCluster)();
exports.CLUSTER = CLUSTER;
const FEE_RECIEVER = new web3_js_1.PublicKey("6foZfeTXxh8P7AndfeTzpmhJzXY7mTNPHBfF7E7B3avr");
exports.FEE_RECIEVER = FEE_RECIEVER;
const DEVNET_PROGRAM = new web3_js_1.PublicKey("DRay6fNdQ5J82H7xV6uq2aV3mNrUZ1J4PgSKsWgptcm6");
const MAINNET_PROGRAM = new web3_js_1.PublicKey("LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj");
const CPCONFIG_DEVNET = new web3_js_1.PublicKey("3aBCy6rdPGK3w5EQzaRxmTgJHKFHQusMMEzBJ8q6o17R");
const CPCONFIG_MAINNET = new web3_js_1.PublicKey("JDAmYWR63gixwAR6Q4f7ynyaDQMVJXZaMZCxBuZsUWTC");
const CPCONFIG = CLUSTER === "mainnet" ? CPCONFIG_MAINNET : CPCONFIG_DEVNET;
exports.CPCONFIG = CPCONFIG;
const PROGRAM_ID = CLUSTER === "mainnet" ? MAINNET_PROGRAM : DEVNET_PROGRAM;
exports.PROGRAM_ID = PROGRAM_ID;
const PINATA_JWT = (0, helper_1.requireEnv)("PINATA_JWT");
const GATEWAY_URL = (0, helper_1.requireEnv)("GATEWAY_URL");
exports.GATEWAY_URL = GATEWAY_URL;
const PINATA = new pinata_1.PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: GATEWAY_URL
});
exports.PINATA = PINATA;
const MAINNET_API_URL = "https://launch-mint-v1.raydium.io";
const DEVNET_API_URL = "https://launch-mint-v1-devnet.raydium.io";
const API_URL = CLUSTER === "mainnet" ? MAINNET_API_URL : DEVNET_API_URL;
exports.API_URL = API_URL;
const buyAmount = (0, helper_1.requireEnv)("BUY_AMOUNT");
exports.buyAmount = buyAmount;
const SLIPPAGE = parseInt((0, helper_1.requireEnv)("SLIPPAGE"), 10);
exports.SLIPPAGE = SLIPPAGE;
const imagePath = path_1.default.join(__dirname, "../resource", "images");
exports.imagePath = imagePath;
const metadataDir = path_1.default.join(__dirname, "../resource", "metadata");
exports.metadataDir = metadataDir;
const mintedFolder = path_1.default.join(__dirname, "../resource", "minted");
exports.mintedFolder = mintedFolder;
const tokenInfoCsv = path_1.default.join(__dirname, "../resource", "tokensInfo.csv");
exports.tokenInfoCsv = tokenInfoCsv;
const tokensDir = path_1.default.join(__dirname, "../resource", "tokens");
exports.tokensDir = tokensDir;
const mintFee = 0.025 + 0.0033; //metaplex+solana gas fee + priority fee
const feeBalance = Number(buyAmount) + Number(mintFee);
exports.feeBalance = feeBalance;
