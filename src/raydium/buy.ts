import {
    TxVersion,
    getPdaLaunchpadPoolId,
    Curve,
    PlatformConfig
} from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import { PublicKey } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import { initSdk } from './raydium'
import { PROGRAM_ID, SLIPPAGE } from '../constant'


export async function buy(tokenAddress:PublicKey, buyAmount:BN, feeReceiver:PublicKey) {
    const raydium = await initSdk()
    const mintA = tokenAddress  // mint address
    const mintB = NATIVE_MINT //wsol
    const programId = PROGRAM_ID //program_id

    const poolId = getPdaLaunchpadPoolId(programId, mintA, mintB).publicKey
    const poolInfo = await raydium.launchpad.getRpcPoolInfo({ poolId })
    const data = await raydium.connection.getAccountInfo(poolInfo.platformId)
    const platformInfo = PlatformConfig.decode(data!.data)
    const mintInfo = await raydium.token.getTokenInfo(mintA)
    const epochInfo = await raydium.connection.getEpochInfo()

 
    const res = Curve.buyExactIn({
        poolInfo,
        amountB: buyAmount,
        protocolFeeRate: poolInfo.configInfo.tradeFeeRate,
        platformFeeRate: platformInfo.feeRate,
        curveType: poolInfo.configInfo.curveType,
        shareFeeRate : poolInfo.configInfo.maxShareFeeRate,
        creatorFeeRate: platformInfo.creatorFeeRate,
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
        slot: await raydium.connection.getSlot(),
    })

    
    const { transaction, extInfo, execute } = await raydium.launchpad.buyToken({
        programId,
        mintA,
        mintAProgram: new PublicKey(mintInfo.programId),
        poolInfo,
        slippage: new BN(SLIPPAGE),
        configInfo: poolInfo.configInfo,
        platformFeeRate: platformInfo.feeRate,
        txVersion: TxVersion.V0,
        buyAmount: buyAmount,
        shareFeeReceiver : feeReceiver, 
        shareFeeRate :poolInfo.configInfo.maxShareFeeRate
    })

    return {
        transaction,
        extInfo,
        execute
    }

}

