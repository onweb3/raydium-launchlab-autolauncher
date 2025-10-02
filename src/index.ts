import { CONNECTION, OWNER } from "./constant";
import { collectAllCreatorFees } from "./raydium/claimFee";
import { checkBalance } from "./utils/check";
import { cleanupAllEmptyTokenAccounts } from "./utils/cleanUp";
import { createMetaData } from "./utils/createMetadata";
import { createToken } from "./utils/createToken";
import { waitMs } from "./utils/wait";
import { waitAndSell } from "./utils/waitAndSell";
import { unwrapSol } from "./utils/wsolUtils";

async function main() {
    while (true) {
        try {
            await checkBalance();
            const tokenInfo = await createMetaData();
            await createToken(tokenInfo);
            await waitAndSell(tokenInfo.mint.publicKey);
            await collectAllCreatorFees();
            await unwrapSol(CONNECTION, OWNER);
            await cleanupAllEmptyTokenAccounts();

            console.log("✅ Cycle complete. Restarting...\n");
            await waitMs(2000)
            
        } catch (err) {
            console.error("❌ Error in cycle:", err);
            await waitMs(2000)
            
        }
    }
}

main();
