import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { buyAmount, CONNECTION, feeBalance, OWNER } from "../constant";

export async function checkBalance() {
    const solanaBalance = await CONNECTION.getBalance(OWNER.publicKey);
    
    if (solanaBalance < (feeBalance * LAMPORTS_PER_SOL)) {
        console.log("low balance: must have balance greater than buy amount");
        throw new Error(`balance low\nCURRENT_BALANCE:${solanaBalance/LAMPORTS_PER_SOL}\nREQUIRE:${feeBalance.toFixed(5)}`);
    }
    
}