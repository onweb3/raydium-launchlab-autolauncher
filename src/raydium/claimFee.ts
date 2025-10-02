import {
    printSimulate,
    ApiV3Token,
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import axios from 'axios'
import { MintInfo } from '../types/raydium'
import { initSdk } from './raydium'
import { API_URL, PROGRAM_ID, txVersion } from '../constant'



export async function collectAllCreatorFees() {
    const raydium = await initSdk()

    const host = API_URL

    const ownerCreatedMintRes: { id: string; success: boolean; data: { rows: MintInfo[]; nextPageId?: string } } = (
        await axios.get(`${host}/get/by/user?wallet=${raydium.ownerPubKey.toBase58()}&size=100`)
    ).data

    if (!ownerCreatedMintRes.data || !ownerCreatedMintRes.data.rows.length) {
        console.log('owner did not have any created mints')
        process.exit()
    } else {
        console.log(ownerCreatedMintRes.data.rows.length)
    }

    const allMintB: Record<string, ApiV3Token> = {}
    ownerCreatedMintRes.data.rows.forEach((d) => {
        allMintB[d.mintB.address] = d.mintB
    })
    const allMintBArray = Object.values(allMintB)

    const { transactions, execute } = await raydium.launchpad.claimMultipleCreatorFee({
        // currently we only have SOL as mintB, so this array should only have 1 item
        programId: PROGRAM_ID,
        mintBList: allMintBArray.map((mint) => ({
            pubKey: new PublicKey(mint.address),
            programId: new PublicKey(mint.programId),
        })),
        txVersion: txVersion,
       
    })

    printSimulate(transactions)

    try {
        const sentInfo = await execute({ sequentially: true })
        console.log(sentInfo)
    } catch (e: any) {
        console.log(e)
    }

  
}

