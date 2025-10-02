import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createSyncNativeInstruction,
    TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    createCloseAccountInstruction,
    AccountLayout,
} from "@solana/spl-token";

/**
 * Safely wraps SOL into WSOL in the associated token account.
 * Automatically creates the ATA and syncs it.
 */
export async function wrapSol(
    connection: Connection,
    payer: Keypair,
    amountInSol: number
): Promise<PublicKey> {
    const lamports = Math.round(amountInSol * LAMPORTS_PER_SOL);
    const wsolAta = await getAssociatedTokenAddress(NATIVE_MINT, payer.publicKey);

    const instructions = [];

    const ataAccount = await connection.getAccountInfo(wsolAta);
    if (!ataAccount) {
        // Create ATA for WSOL
        instructions.push(
            createAssociatedTokenAccountInstruction(
                payer.publicKey,
                wsolAta,
                payer.publicKey,
                NATIVE_MINT
            )
        );
    } else {
        // Check if owned by Token program and valid WSOL
        if (!ataAccount.owner.equals(TOKEN_PROGRAM_ID)) {
            throw new Error(`⚠️ Account ${wsolAta.toBase58()} not owned by Token program`);
        }
    }

    // Transfer SOL into the WSOL ATA
    instructions.push(
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: wsolAta,
            lamports,
        })
    );

    // Sync the native WSOL account
    instructions.push(createSyncNativeInstruction(wsolAta));

    const tx = new Transaction().add(...instructions);
    await sendAndConfirmTransaction(connection, tx, [payer], { commitment: "confirmed" });

    console.log(`✅ Wrapped ${amountInSol} SOL into ${wsolAta.toBase58()}`);

    return wsolAta;
}


/**
 * Unwraps wSOL back to SOL by closing the ATA.
 * - Syncs balance first to ensure correct lamports returned
 */

export async function unwrapSol(
    connection: Connection,
    payer: Keypair
): Promise<void> {
    const wsolAta = await getAssociatedTokenAddress(NATIVE_MINT, payer.publicKey);

    const accountInfo = await connection.getAccountInfo(wsolAta);
    if (!accountInfo) {
        console.warn(`No WSOL ATA found for ${payer.publicKey.toBase58()}`);
        return;
    }

    // Must be owned by SPL Token program
    if (!accountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        console.warn(`Account ${wsolAta.toBase58()} not owned by Token program`);
        return;
    }

    // Check if it's actually a WSOL token account
    const data = Buffer.from(accountInfo.data);
    const mint = new PublicKey(AccountLayout.decode(data).mint);
    if (!mint.equals(NATIVE_MINT)) {
        console.warn(`Account ${wsolAta.toBase58()} is not WSOL`);
        return;
    }

    // Proceed to sync and close
    const syncIx = createSyncNativeInstruction(wsolAta);
    const closeIx = createCloseAccountInstruction(wsolAta, payer.publicKey, payer.publicKey);
    const tx = new Transaction().add(syncIx, closeIx);
    await sendAndConfirmTransaction(connection, tx, [payer], { commitment: "confirmed" });
}