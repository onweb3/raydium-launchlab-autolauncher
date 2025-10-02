"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenBalance = getTokenBalance;
exports.getTokenBalanceWithRetry = getTokenBalanceWithRetry;
const spl_token_1 = require("@solana/spl-token");
const wait_1 = require("./wait");
/**
 * Get the balance of an SPL token for a given wallet
 * @param connection Solana RPC connection
 * @param walletAddress PublicKey of the wallet owner
 * @param tokenMint PublicKey of the token mint (e.g. USDC, your custom token)
 * @returns balance as number (with decimals applied)
 */
async function getTokenBalance(connection, walletAddress, tokenMint) {
    try {
        // Derive the ATA (associated token account) for this wallet + mint
        const ata = await (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, walletAddress);
        // Fetch account info
        const accountInfo = await (0, spl_token_1.getAccount)(connection, ata);
        return Number(accountInfo.amount);
    }
    catch (e) {
        if (e.message?.includes('TokenAccountNotFoundError')) {
            return 0; // Wallet doesn’t have this token yet
        }
        throw e;
    }
}
async function getTokenBalanceWithRetry(connection, owner, mint, maxRetries = 50, retryDelayMs = 400) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const balance = await getTokenBalance(connection, owner, mint);
            console.log(`✓ Token account found! Balance: ${balance}`);
            return balance;
        }
        catch (error) {
            if (i === maxRetries - 1) {
                console.error('Failed to find token account after max retries');
                throw error;
            }
            console.log(`⏳ Token account not found yet, retrying in ${retryDelayMs / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
            await (0, wait_1.waitMs)(retryDelayMs);
        }
    }
    throw new Error('Failed to get token balance');
}
