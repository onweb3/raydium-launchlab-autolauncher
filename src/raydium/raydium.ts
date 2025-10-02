import { DEV_API_URLS, Raydium, parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { CLUSTER, CONNECTION, OWNER } from '../constant'

let raydium: Raydium | undefined

export const initSdk = async (params?: { loadToken?: boolean }) => {
    if (raydium) return raydium

    raydium = await Raydium.load({
        owner: OWNER,
        connection: CONNECTION,
        cluster: CLUSTER,
        disableFeatureCheck: true,
        disableLoadToken: !params?.loadToken,
        blockhashCommitment: 'finalized',
        ...(CLUSTER === 'devnet'
            ? {
                urlConfigs: {
                    ...DEV_API_URLS,
                    BASE_HOST: 'https://api-v3-devnet.raydium.io',
                    OWNER_BASE_HOST: 'https://owner-v1-devnet.raydium.io',
                    SWAP_HOST: 'https://transaction-v1-devnet.raydium.io',
                    CPMM_LOCK: 'https://dynamic-ipfs-devnet.raydium.io/lock/cpmm/position',
                },
            }
            : {}),
    })

    /**
     * By default: sdk will automatically fetch token account data when need it or any sol balace changed.
     * if you want to handle token account by yourself, set token account data after init sdk
     * code below shows how to do it.
     * note: after call raydium.account.updateTokenAccount, raydium will not automatically fetch token account
     */

    /*  
    raydium.account.updateTokenAccount(await fetchTokenAccountData())
    connection.onAccountChange(owner.publicKey, async () => {
      raydium!.account.updateTokenAccount(await fetchTokenAccountData())
    })
    */

    return raydium
}

export const fetchTokenAccountData = async () => {
    const solAccountResp = await CONNECTION.getAccountInfo(OWNER.publicKey)
    const tokenAccountResp = await CONNECTION.getTokenAccountsByOwner(OWNER.publicKey, { programId: TOKEN_PROGRAM_ID })
    const token2022Req = await CONNECTION.getTokenAccountsByOwner(OWNER.publicKey, { programId: TOKEN_2022_PROGRAM_ID })
    const tokenAccountData = parseTokenAccountResp({
        owner: OWNER.publicKey,
        solAccountResp,
        tokenAccountResp: {
            context: tokenAccountResp.context,
            value: [...tokenAccountResp.value, ...token2022Req.value],
        },
    })
    return tokenAccountData
}

