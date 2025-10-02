"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectAllCreatorFees = collectAllCreatorFees;
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const web3_js_1 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
const raydium_1 = require("./raydium");
const constant_1 = require("../constant");
async function collectAllCreatorFees() {
    const raydium = await (0, raydium_1.initSdk)();
    const host = constant_1.API_URL;
    const ownerCreatedMintRes = (await axios_1.default.get(`${host}/get/by/user?wallet=${raydium.ownerPubKey.toBase58()}&size=100`)).data;
    if (!ownerCreatedMintRes.data || !ownerCreatedMintRes.data.rows.length) {
        console.log('owner did not have any created mints');
        process.exit();
    }
    else {
        console.log(ownerCreatedMintRes.data.rows.length);
    }
    const allMintB = {};
    ownerCreatedMintRes.data.rows.forEach((d) => {
        allMintB[d.mintB.address] = d.mintB;
    });
    const allMintBArray = Object.values(allMintB);
    const { transactions, execute } = await raydium.launchpad.claimMultipleCreatorFee({
        // currently we only have SOL as mintB, so this array should only have 1 item
        programId: constant_1.PROGRAM_ID,
        mintBList: allMintBArray.map((mint) => ({
            pubKey: new web3_js_1.PublicKey(mint.address),
            programId: new web3_js_1.PublicKey(mint.programId),
        })),
        txVersion: constant_1.txVersion,
    });
    (0, raydium_sdk_v2_1.printSimulate)(transactions);
    try {
        const sentInfo = await execute({ sequentially: true });
        console.log(sentInfo);
    }
    catch (e) {
        console.log(e);
    }
}
