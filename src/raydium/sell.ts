import {
    Curve,
    TxVersion,
    getPdaLaunchpadPoolId,
    PlatformConfig,
} from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import { PublicKey } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import { initSdk } from './raydium'
import { PROGRAM_ID, SLIPPAGE } from '../constant'

export  async function sell( tokenAddress:PublicKey, sellAmount:BN,  feeReceiver:PublicKey) {
    const raydium = await initSdk()

    const mintA = tokenAddress
    const mintB = NATIVE_MINT

    const programId = PROGRAM_ID

    const poolId = getPdaLaunchpadPoolId(programId, mintA, mintB).publicKey
    const poolInfo = await raydium.launchpad.getRpcPoolInfo({ poolId })
    const data = await raydium.connection.getAccountInfo(poolInfo.platformId)
    const platformInfo = PlatformConfig.decode(data!.data)

    const inAmount = sellAmount

    const mintInfo = await raydium.token.getTokenInfo(mintA)
    const epochInfo = await raydium.connection.getEpochInfo()

    const res = Curve.sellExactIn({
        poolInfo,
        amountA: inAmount,
        protocolFeeRate: poolInfo.configInfo.tradeFeeRate,
        platformFeeRate: platformInfo.feeRate,
        curveType: poolInfo.configInfo.curveType,
        shareFeeRate: poolInfo.configInfo.maxShareFeeRate,
        creatorFeeRate: platformInfo.creatorFeeRate,
        slot: await raydium.connection.getSlot(),
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
    });

      const { execute, transaction, builder } = await raydium.launchpad.sellToken({
        programId,
        mintA,
        mintAProgram: new PublicKey(mintInfo.programId),
        poolInfo,
        configInfo: poolInfo.configInfo,
        platformFeeRate: platformInfo.feeRate,
        txVersion: TxVersion.V0,
        sellAmount: inAmount,
        shareFeeReceiver: feeReceiver,
        shareFeeRate: poolInfo.configInfo.maxShareFeeRate,
        slippage:new BN(SLIPPAGE)
    })

 
    return {
        execute,
        transaction,
        builder
    }
}

