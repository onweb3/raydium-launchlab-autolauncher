"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = createToken;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const createToken_1 = require("../raydium/createToken");
const constant_1 = require("../constant");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
async function createToken(tokenInfo) {
    const token = await (0, createToken_1.createMint)(tokenInfo.mint, new bn_js_1.BN(Number(constant_1.buyAmount) * web3_js_1.LAMPORTS_PER_SOL), tokenInfo.name, tokenInfo.symbol, tokenInfo.uri, constant_1.FEE_RECIEVER);
    try {
        const tx = await token.execute({ sequentially: true, sendAndConfirm: true });
        const tokenAddress = tokenInfo.mint.publicKey.toString() + ".json";
        const mintedTokenFolder = path_1.default.join(constant_1.mintedFolder, tokenAddress);
        fs_1.default.writeFileSync(mintedTokenFolder, JSON.stringify(token.extInfo, null, 2));
        console.log("ExtInfo saved at:", constant_1.mintedFolder);
        console.log(`token minted : https://solscan.io/tx/${tx.txIds[0]}?cluster=${constant_1.CLUSTER}\n`);
        if (constant_1.CLUSTER === "mainnet") {
            console.log(`live on https://raydium.io/launchpad/token/?mint=${tokenInfo.mint.publicKey.toString()}`);
        }
        console.log("Waiting for transaction confirmation...");
        const latestBlockhash = await constant_1.CONNECTION.getLatestBlockhash();
        await constant_1.CONNECTION.confirmTransaction({
            signature: tx.txIds[0],
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        }, 'confirmed');
        console.log("Transaction confirmed!");
        return {
            token,
            tx
        };
    }
    catch (e) {
        console.log("error:", e);
    }
}
