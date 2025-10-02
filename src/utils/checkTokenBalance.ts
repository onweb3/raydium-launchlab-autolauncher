import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import { waitMs } from './wait'

/**
 * Get the balance of an SPL token for a given wallet
 * @param connection Solana RPC connection
 * @param walletAddress PublicKey of the wallet owner
 * @param tokenMint PublicKey of the token mint (e.g. USDC, your custom token)
 * @returns balance as number (with decimals applied)
 */
export async function getTokenBalance(
    connection: Connection,
    walletAddress: PublicKey,
    tokenMint: PublicKey
): Promise<number> {
    try {
        // Derive the ATA (associated token account) for this wallet + mint
        const ata = await getAssociatedTokenAddress(tokenMint, walletAddress)

        // Fetch account info
        const accountInfo = await getAccount(connection, ata)

        

        return Number(accountInfo.amount) 
    } catch (e: any) {
        if (e.message?.includes('TokenAccountNotFoundError')) {
            return 0 // Wallet doesn’t have this token yet
        }
        throw e
    }
}
export async function getTokenBalanceWithRetry(
    connection: any,
    owner: PublicKey,
    mint: PublicKey,
    maxRetries = 50,
    retryDelayMs = 400
) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const balance = await getTokenBalance(connection, owner, mint);
            console.log(`✓ Token account found! Balance: ${balance}`);
            return balance;
        } catch (error: any) {
            if (i === maxRetries - 1) {
                console.error('Failed to find token account after max retries');
                throw error;
            }
            console.log(`⏳ Token account not found yet, retrying in ${retryDelayMs / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
            await waitMs(retryDelayMs);
        }
    }
    throw new Error('Failed to get token balance');
}
