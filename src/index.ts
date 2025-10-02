import { CONNECTION, OWNER } from "./constant";
import { collectAllCreatorFees } from "./raydium/claimFee";
import { checkBalance } from "./utils/check";
import { ensureDirectories } from "./utils/checkDir";
import { hasValidImages } from "./utils/checkImagesExists";
import { cleanupAllEmptyTokenAccounts } from "./utils/cleanUp";
import { createMetaData } from "./utils/createMetadata";
import { createToken } from "./utils/createToken";
import { isCsvValid } from "./utils/isValidCsv";
import { waitMs } from "./utils/wait";
import { waitAndSell } from "./utils/waitAndSell";
import { unwrapSol } from "./utils/wsolUtils";

async function main() {
    while (true) {
        try {
            ensureDirectories();
            if (!hasValidImages()) {
                console.log("add a valid image file to the resource/images folder\n supported extensions :.png .jpg .jpeg .webp .gif")
                process.exit();
            }
            if (!isCsvValid()) {
                console.log(
                  "invalid csv:\n please refer to this link for valid csv file\n\nhttps://github.com/onweb3/raydium-launchlab-autolauncher/blob/main/resource/tokensInfo.csv"
                );
            }
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
