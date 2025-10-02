"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForProfit = checkForProfit;
const axios_1 = __importDefault(require("axios"));
const constant_1 = require("../constant");
const raydium_1 = require("../raydium/raydium");
async function checkForProfit() {
    const raydium = await (0, raydium_1.initSdk)();
    const ownerCreatedMintRes = (await axios_1.default.get(`${constant_1.API_URL}/get/by/user?wallet=${raydium.ownerPubKey.toBase58()}&size=100`)).data;
    if (!ownerCreatedMintRes.data || !ownerCreatedMintRes.data.rows.length) {
        console.log('owner did not have any created mints');
        process.exit();
    }
    console.log("total created tokens :", ownerCreatedMintRes.data.rows.length);
    ///wip
}
