import fs from "fs";
import path from "path";
import { createMint } from "../raydium/createToken";
import { TokenInfo } from "../types/token";
import { buyAmount, CLUSTER,  CONNECTION,  FEE_RECIEVER, mintedFolder } from "../constant";
import { LAMPORTS_PER_SOL  } from "@solana/web3.js";
import { BN } from "bn.js";

export async function createToken(tokenInfo:TokenInfo) {
    const token = await createMint(tokenInfo.mint, new BN(Number(buyAmount) * LAMPORTS_PER_SOL), tokenInfo.name, tokenInfo.symbol, tokenInfo.uri, FEE_RECIEVER)
    try {
        const tx = await token.execute({sequentially:true,sendAndConfirm:true});
        const tokenAddress = tokenInfo.mint.publicKey.toString() + ".json";
        const mintedTokenFolder = path.join(mintedFolder, tokenAddress);
        fs.writeFileSync(mintedTokenFolder, JSON.stringify(token.extInfo, null, 2));

        console.log("ExtInfo saved at:", mintedFolder);

        console.log(`token minted : https://solscan.io/tx/${tx.txIds[0]}?cluster=${CLUSTER}\n`);
        if (CLUSTER === "mainnet") {
            console.log(`live on https://raydium.io/launchpad/token/?mint=${tokenInfo.mint.publicKey.toString()}`)
        }
        console.log("Waiting for transaction confirmation...");
        const latestBlockhash = await CONNECTION.getLatestBlockhash();
        await CONNECTION.confirmTransaction({
            signature: tx.txIds[0],
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        }, 'confirmed');
        console.log("Transaction confirmed!");
        return {
            token,
            tx
        }

        
    } catch(e) {
        console.log("error:", e);
    }
}