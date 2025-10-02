"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBalance = checkBalance;
const web3_js_1 = require("@solana/web3.js");
const constant_1 = require("../constant");
async function checkBalance() {
    const solanaBalance = await constant_1.CONNECTION.getBalance(constant_1.OWNER.publicKey);
    if (solanaBalance < (constant_1.feeBalance * web3_js_1.LAMPORTS_PER_SOL)) {
        console.log("low balance: must have balance greater than buy amount");
        throw new Error(`balance low\nCURRENT_BALANCE:${solanaBalance / web3_js_1.LAMPORTS_PER_SOL}\nREQUIRE:${constant_1.feeBalance.toFixed(5)}`);
    }
}
