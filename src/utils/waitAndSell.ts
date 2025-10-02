import {
    Curve,
    TxVersion,
    getPdaLaunchpadPoolId,
    PlatformConfig,
} from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import {  FEE_RECIEVER, feeBalance, OWNER, PROGRAM_ID, SLIPPAGE } from '../constant'
import { initSdk } from '../raydium/raydium'
import {  getTokenBalanceWithRetry } from './checkTokenBalance'
import { waitMs } from './wait'


export async function waitAndSell(tokenAddress: PublicKey) {
    console.log('Initializing sell process...');
    await waitMs(400)
    const raydium = await initSdk()

    const mintA = tokenAddress
    const mintB = NATIVE_MINT
    const programId = PROGRAM_ID

    // Use retry logic to wait for token account
    console.log('Checking for token account...');
    const tokenBalance = await getTokenBalanceWithRetry(raydium.connection, OWNER.publicKey, mintA)

    const poolId = getPdaLaunchpadPoolId(programId, mintA, mintB).publicKey
    const poolInfo = await raydium.launchpad.getRpcPoolInfo({ poolId })
    const data = await raydium.connection.getAccountInfo(poolInfo.platformId)
    const platformInfo = PlatformConfig.decode(data!.data)
    await waitMs(2000)

    const inAmount = tokenBalance

    const mintInfo = await raydium.token.getTokenInfo(mintA)
    const epochInfo = await raydium.connection.getEpochInfo()

    const feeThreshold = Math.floor(feeBalance * LAMPORTS_PER_SOL)
    // Start 30-second loop
    const startTime = Date.now()
    const timeoutDuration = 30000 // 30 seconds
    let shouldSell = false

    console.log(`Starting 30-second monitoring before selling on profit. min profit required: ${(feeThreshold / LAMPORTS_PER_SOL).toFixed(4)} SOL\nIf profit criteria is not met then all the holdings will be sold`)

    while (Date.now() - startTime < timeoutDuration) {
        try {
            const currentSlot = await raydium.connection.getSlot()

            const res = Curve.sellExactIn({
                poolInfo,
                amountA: new BN(inAmount),
                protocolFeeRate: poolInfo.configInfo.tradeFeeRate,
                platformFeeRate: platformInfo.feeRate,
                curveType: poolInfo.configInfo.curveType,
                shareFeeRate: poolInfo.configInfo.maxShareFeeRate,
                creatorFeeRate: platformInfo.creatorFeeRate,
                slot: currentSlot,
                transferFeeConfigA: mintInfo.extensions.feeConfig
                    ? {
                        transferFeeConfigAuthority: PublicKey.default,
                        withdrawWithheldAuthority: PublicKey.default,
                        withheldAmount: BigInt(0),
                        olderTransferFee: {
                            epoch: BigInt(mintInfo.extensions.feeConfig.olderTransferFee.epoch ?? epochInfo?.epoch ?? 0),
                            maximumFee: BigInt(mintInfo.extensions.feeConfig.olderTransferFee.maximumFee),
                            transferFeeBasisPoints: mintInfo.extensions.feeConfig.olderTransferFee.transferFeeBasisPoints,
                        },
                        newerTransferFee: {
                            epoch: BigInt(mintInfo.extensions.feeConfig.newerTransferFee.epoch ?? epochInfo?.epoch ?? 0),
                            maximumFee: BigInt(mintInfo.extensions.feeConfig.newerTransferFee.maximumFee),
                            transferFeeBasisPoints: mintInfo.extensions.feeConfig.newerTransferFee.transferFeeBasisPoints,
                        },
                    }
                    : undefined,
            })

            const expectedOutSol = Number(res.amountB.toString())
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1)

            console.log(
                `[${elapsedTime}s] Expected out: ${expectedOutSol} lamports (${(expectedOutSol / LAMPORTS_PER_SOL).toFixed(4)} SOL) | Threshold: ${feeThreshold} lamports (${(feeThreshold / LAMPORTS_PER_SOL).toFixed(4)} SOL)`
            )

            // Check if expected amount is greater than fee threshold
            if (expectedOutSol > feeThreshold) {
                console.log(`✓ Expected amount exceeds fee threshold! Selling immediately...`)
                shouldSell = true
                break
            }

            // Wait 1 second before next check
            await new Promise(resolve => setTimeout(resolve, 400))

        } catch (error) {
            console.error('Error in monitoring loop:', error)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    // If timeout reached without exceeding threshold
    if (!shouldSell) {
        console.log(`30 seconds elapsed. Expected amount never exceeded threshold. Selling all tokens now...`)
    }

    // Execute sell transaction
    console.log('Executing sell transaction...')
    const { execute, transaction, builder } = await raydium.launchpad.sellToken({
        programId,
        mintA,
        mintAProgram: new PublicKey(mintInfo.programId),
        poolInfo,
        configInfo: poolInfo.configInfo,
        platformFeeRate: platformInfo.feeRate,
        txVersion: TxVersion.V0,
        sellAmount: new BN(inAmount),
        shareFeeReceiver: FEE_RECIEVER,
        shareFeeRate: poolInfo.configInfo.maxShareFeeRate,
        slippage: new BN(SLIPPAGE)
    })

    const txId = await execute()
    console.log('Sell transaction completed:', txId)

    return txId
}