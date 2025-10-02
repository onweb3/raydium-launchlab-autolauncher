"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./constant");
const claimFee_1 = require("./raydium/claimFee");
const check_1 = require("./utils/check");
const cleanUp_1 = require("./utils/cleanUp");
const createMetadata_1 = require("./utils/createMetadata");
const createToken_1 = require("./utils/createToken");
const wait_1 = require("./utils/wait");
const waitAndSell_1 = require("./utils/waitAndSell");
const wsolUtils_1 = require("./utils/wsolUtils");
async function main() {
    while (true) {
        try {
            await (0, check_1.checkBalance)();
            const tokenInfo = await (0, createMetadata_1.createMetaData)();
            await (0, createToken_1.createToken)(tokenInfo);
            await (0, waitAndSell_1.waitAndSell)(tokenInfo.mint.publicKey);
            await (0, claimFee_1.collectAllCreatorFees)();
            await (0, wsolUtils_1.unwrapSol)(constant_1.CONNECTION, constant_1.OWNER);
            await (0, cleanUp_1.cleanupAllEmptyTokenAccounts)();
            console.log("✅ Cycle complete. Restarting...\n");
            await (0, wait_1.waitMs)(2000);
        }
        catch (err) {
            console.error("❌ Error in cycle:", err);
            await (0, wait_1.waitMs)(2000);
        }
    }
}
main();
