import {  PublicKey } from '@solana/web3.js';
import { closeAccount, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONNECTION, OWNER } from '../constant';

// WSOL mint address
const WSOL_MINT = NATIVE_MINT
/**
 * Closes all empty token accounts (balance = 0) including WSOL accounts
 * Reclaims rent from closed accounts
 */
export async function cleanupAllEmptyTokenAccounts() {
    try {
        console.log('🧹 Starting cleanup of all empty token accounts...');
        console.log(`Wallet: ${OWNER.publicKey.toString()}\n`);

        // Get all token accounts owned by the wallet
        const tokenAccounts = await CONNECTION.getParsedTokenAccountsByOwner(
            OWNER.publicKey,
            { programId: TOKEN_PROGRAM_ID }
        );

        console.log(`Found ${tokenAccounts.value.length} total token account(s)\n`);

        let closedCount = 0;
        let totalRentReclaimed = 0;
        const failures: { address: string; error: string }[] = [];

        for (const { pubkey, account } of tokenAccounts.value) {
            const parsedInfo = account.data.parsed.info;
            const mint = new PublicKey(parsedInfo.mint);
            const balance = parsedInfo.tokenAmount.uiAmount;
            const decimals = parsedInfo.tokenAmount.decimals;
            const rawBalance = parsedInfo.tokenAmount.amount;

            // Check if account is empty (balance = 0)
            if (rawBalance === '0' || balance === 0) {
                const isWSOL = mint.equals(WSOL_MINT);
                const rentLamports = account.lamports;
                const rentSOL = rentLamports / 1e9;

                console.log(`📦 Found empty account:`);
                console.log(`   Address: ${pubkey.toString()}`);
                console.log(`   Mint: ${mint.toString()}`);
                console.log(`   Type: ${isWSOL ? '💰 WSOL' : '🪙 Token'}`);
                console.log(`   Balance: ${balance}`);
                console.log(`   Rent to reclaim: ${rentSOL.toFixed(6)} SOL`);

                try {
                    // Close the account
                    const signature = await closeAccount(
                        CONNECTION,
                        OWNER, // Payer
                        pubkey, // Token account to close
                        OWNER.publicKey, // Destination for rent
                        OWNER, // Authority
                        [],
                        { commitment: 'confirmed' }
                    );

                    console.log(`   ✅ Closed! TX: ${signature}\n`);

                    closedCount++;
                    totalRentReclaimed += rentSOL;

                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 300));

                } catch (error: any) {
                    console.error(`   ❌ Failed to close: ${error.message}\n`);
                    failures.push({
                        address: pubkey.toString(),
                        error: error.message
                    });
                }
            } else {
                console.log(`⏭️  Skipping account with balance: ${balance} (${mint.toString().slice(0, 8)}...)`);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 CLEANUP SUMMARY');
        console.log('='.repeat(60));

        if (closedCount === 0 && failures.length === 0) {
            console.log('✨ No empty token accounts found to clean up');
        } else {
            console.log(`✅ Successfully closed: ${closedCount} account(s)`);
            console.log(`💰 Total rent reclaimed: ${totalRentReclaimed.toFixed(6)} SOL`);

            if (failures.length > 0) {
                console.log(`❌ Failed to close: ${failures.length} account(s)`);
                console.log('\nFailed accounts:');
                failures.forEach(f => {
                    console.log(`   - ${f.address}: ${f.error}`);
                });
            }
        }
        console.log('='.repeat(60) + '\n');

        return {
            success: true,
            closedCount,
            totalRentReclaimed,
            failures
        };

    } catch (error) {
        console.error('Error during token account cleanup:', error);
        throw error;
    }
}

/**
 * Lists all token accounts (empty and non-empty) for inspection
 */
export async function listAllTokenAccounts() {
    try {
        console.log('📋 Listing all token accounts...\n');

        const tokenAccounts = await CONNECTION.getParsedTokenAccountsByOwner(
            OWNER.publicKey,
            { programId: TOKEN_PROGRAM_ID }
        );

        const emptyAccounts: any[] = [];
        const activeAccounts: any[] = [];

        for (const { pubkey, account } of tokenAccounts.value) {
            const parsedInfo = account.data.parsed.info;
            const mint = new PublicKey(parsedInfo.mint);
            const balance = parsedInfo.tokenAmount.uiAmount;
            const rawBalance = parsedInfo.tokenAmount.amount;
            const isWSOL = mint.equals(WSOL_MINT);
            const rentSOL = account.lamports / 1e9;

            const accountInfo = {
                address: pubkey.toString(),
                mint: mint.toString(),
                balance: balance,
                rawBalance: rawBalance,
                isWSOL: isWSOL,
                rentSOL: rentSOL,
                isEmpty: rawBalance === '0'
            };

            if (rawBalance === '0') {
                emptyAccounts.push(accountInfo);
            } else {
                activeAccounts.push(accountInfo);
            }
        }

        console.log(`Total accounts: ${tokenAccounts.value.length}`);
        console.log(`Empty accounts: ${emptyAccounts.length}`);
        console.log(`Active accounts: ${activeAccounts.length}\n`);

        if (emptyAccounts.length > 0) {
            console.log('🗑️  EMPTY ACCOUNTS (Can be closed):');
            console.log('-'.repeat(60));
            emptyAccounts.forEach((acc, i) => {
                console.log(`${i + 1}. ${acc.address}`);
                console.log(`   Mint: ${acc.mint}`);
                console.log(`   Type: ${acc.isWSOL ? 'WSOL' : 'Token'}`);
                console.log(`   Rent: ${acc.rentSOL.toFixed(6)} SOL`);
                console.log('');
            });

            const totalRent = emptyAccounts.reduce((sum, acc) => sum + acc.rentSOL, 0);
            console.log(`💰 Total rent reclaimable: ${totalRent.toFixed(6)} SOL\n`);
        }

        if (activeAccounts.length > 0) {
            console.log('✅ ACTIVE ACCOUNTS (With balance):');
            console.log('-'.repeat(60));
            activeAccounts.forEach((acc, i) => {
                console.log(`${i + 1}. ${acc.address}`);
                console.log(`   Mint: ${acc.mint}`);
                console.log(`   Balance: ${acc.balance}`);
                console.log(`   Type: ${acc.isWSOL ? 'WSOL' : 'Token'}`);
                console.log('');
            });
        }

        return {
            emptyAccounts,
            activeAccounts,
            totalAccounts: tokenAccounts.value.length
        };

    } catch (error) {
        console.error('Error listing token accounts:', error);
        throw error;
    }
}

/**
 * Force close a specific token account (even if it has balance - be careful!)
 */
export async function forceCloseTokenAccount(accountAddress: PublicKey) {
    try {
        console.log(`⚠️  Force closing account: ${accountAddress.toString()}`);
        console.log('WARNING: This will close the account even if it has a balance!\n');

        const signature = await closeAccount(
            CONNECTION,
            OWNER,
            accountAddress,
            OWNER.publicKey,
            OWNER,
            [],
            { commitment: 'confirmed' }
        );

        console.log(`✅ Account closed successfully`);
        console.log(`Transaction: ${signature}`);

        return signature;

    } catch (error) {
        console.error('Error force closing account:', error);
        throw error;
    }
}

/**
 * Clean up only WSOL accounts (empty or with balance)
 */
export async function cleanupOnlyWSOLAccounts() {
    try {
        console.log('🧹 Cleaning up WSOL accounts specifically...\n');

        const tokenAccounts = await CONNECTION.getParsedTokenAccountsByOwner(
            OWNER.publicKey,
            { mint: WSOL_MINT }
        );

        console.log(`Found ${tokenAccounts.value.length} WSOL account(s)\n`);

        let closedCount = 0;
        let totalReclaimed = 0;

        for (const { pubkey, account } of tokenAccounts.value) {
            const parsedInfo = account.data.parsed.info;
            const balance = parsedInfo.tokenAmount.uiAmount;
            const rentSOL = account.lamports / 1e9;

            console.log(`💰 WSOL Account: ${pubkey.toString()}`);
            console.log(`   Balance: ${balance} WSOL`);
            console.log(`   Rent: ${rentSOL.toFixed(6)} SOL`);

            try {
                const signature = await closeAccount(
                    CONNECTION,
                    OWNER,
                    pubkey,
                    OWNER.publicKey,
                    OWNER,
                    [],
                    { commitment: 'confirmed' }
                );

                console.log(`   ✅ Closed! TX: ${signature}\n`);
                closedCount++;
                totalReclaimed += balance + rentSOL;

                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error: any) {
                console.error(`   ❌ Failed: ${error.message}\n`);
            }
        }

        console.log(`✅ Closed ${closedCount} WSOL account(s)`);
        console.log(`💰 Total reclaimed: ${totalReclaimed.toFixed(6)} SOL`);

        return { closedCount, totalReclaimed };

    } catch (error) {
        console.error('Error cleaning WSOL accounts:', error);
        throw error;
    }
}