import {
    getPdaLaunchpadConfigId,
    LaunchpadConfig,
    CpmmCreatorFeeOn,
    printSimulate,
} from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import { Keypair, PublicKey } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import { initSdk } from './raydium'
import { CPCONFIG, PROGRAM_ID, SLIPPAGE, txVersion } from '../constant'


export async function createMint(pair: Keypair , buyAmount:BN , name:string, symbol:string , metadata:string , feeReceiver:PublicKey) {
    const raydium = await initSdk()

    const programId = PROGRAM_ID 
   
    const mintA = pair.publicKey

    const configId = getPdaLaunchpadConfigId(programId, NATIVE_MINT, 0, 0).publicKey

    const configData = await raydium.connection.getAccountInfo(configId)
    if (!configData) throw new Error('config not found')
    const configInfo = LaunchpadConfig.decode(configData.data)
    const mintBInfo = await raydium.token.getTokenInfo(configInfo.mintB)

    const inAmount = buyAmount

    const { execute, transactions, extInfo } = await raydium.launchpad.createLaunchpad({
        programId,
        mintA,
        decimals: 6,
        name: name,
        symbol: symbol,
        migrateType: 'cpmm',
        uri: metadata,

        configId,
        configInfo,
        mintBDecimals: mintBInfo.decimals, 
        platformId: CPCONFIG,
        txVersion: txVersion,
        slippage :new BN(SLIPPAGE),
        buyAmount: inAmount,
        createOnly: false,
        extraSigners: [pair],
        creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB
    })
    printSimulate(transactions)
    return {
        execute, 
        transactions, 
        extInfo
    }
 
}

