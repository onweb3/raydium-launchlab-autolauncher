"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapSol = wrapSol;
exports.unwrapSol = unwrapSol;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
/**
 * Safely wraps SOL into WSOL in the associated token account.
 * Automatically creates the ATA and syncs it.
 */
async function wrapSol(connection, payer, amountInSol) {
    const lamports = Math.round(amountInSol * web3_js_1.LAMPORTS_PER_SOL);
    const wsolAta = await (0, spl_token_1.getAssociatedTokenAddress)(spl_token_1.NATIVE_MINT, payer.publicKey);
    const instructions = [];
    const ataAccount = await connection.getAccountInfo(wsolAta);
    if (!ataAccount) {
        // Create ATA for WSOL
        instructions.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, wsolAta, payer.publicKey, spl_token_1.NATIVE_MINT));
    }
    else {
        // Check if owned by Token program and valid WSOL
        if (!ataAccount.owner.equals(spl_token_1.TOKEN_PROGRAM_ID)) {
            throw new Error(`⚠️ Account ${wsolAta.toBase58()} not owned by Token program`);
        }
    }
    // Transfer SOL into the WSOL ATA
    instructions.push(web3_js_1.SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: wsolAta,
        lamports,
    }));
    // Sync the native WSOL account
    instructions.push((0, spl_token_1.createSyncNativeInstruction)(wsolAta));
    const tx = new web3_js_1.Transaction().add(...instructions);
    await (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [payer], { commitment: "confirmed" });
    console.log(`✅ Wrapped ${amountInSol} SOL into ${wsolAta.toBase58()}`);
    return wsolAta;
}
/**
 * Unwraps wSOL back to SOL by closing the ATA.
 * - Syncs balance first to ensure correct lamports returned
 */
async function unwrapSol(connection, payer) {
    const wsolAta = await (0, spl_token_1.getAssociatedTokenAddress)(spl_token_1.NATIVE_MINT, payer.publicKey);
    const accountInfo = await connection.getAccountInfo(wsolAta);
    if (!accountInfo) {
        console.warn(`No WSOL ATA found for ${payer.publicKey.toBase58()}`);
        return;
    }
    // Must be owned by SPL Token program
    if (!accountInfo.owner.equals(spl_token_1.TOKEN_PROGRAM_ID)) {
        console.warn(`Account ${wsolAta.toBase58()} not owned by Token program`);
        return;
    }
    // Check if it's actually a WSOL token account
    const data = Buffer.from(accountInfo.data);
    const mint = new web3_js_1.PublicKey(spl_token_1.AccountLayout.decode(data).mint);
    if (!mint.equals(spl_token_1.NATIVE_MINT)) {
        console.warn(`Account ${wsolAta.toBase58()} is not WSOL`);
        return;
    }
    // Proceed to sync and close
    const syncIx = (0, spl_token_1.createSyncNativeInstruction)(wsolAta);
    const closeIx = (0, spl_token_1.createCloseAccountInstruction)(wsolAta, payer.publicKey, payer.publicKey);
    const tx = new web3_js_1.Transaction().add(syncIx, closeIx);
    await (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [payer], { commitment: "confirmed" });
}
