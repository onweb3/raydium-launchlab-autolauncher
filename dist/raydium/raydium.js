"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenAccountData = exports.initSdk = void 0;
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const spl_token_1 = require("@solana/spl-token");
const constant_1 = require("../constant");
let raydium;
const initSdk = async (params) => {
    if (raydium)
        return raydium;
    raydium = await raydium_sdk_v2_1.Raydium.load({
        owner: constant_1.OWNER,
        connection: constant_1.CONNECTION,
        cluster: constant_1.CLUSTER,
        disableFeatureCheck: true,
        disableLoadToken: !params?.loadToken,
        blockhashCommitment: 'finalized',
        ...(constant_1.CLUSTER === 'devnet'
            ? {
                urlConfigs: {
                    ...raydium_sdk_v2_1.DEV_API_URLS,
                    BASE_HOST: 'https://api-v3-devnet.raydium.io',
                    OWNER_BASE_HOST: 'https://owner-v1-devnet.raydium.io',
                    SWAP_HOST: 'https://transaction-v1-devnet.raydium.io',
                    CPMM_LOCK: 'https://dynamic-ipfs-devnet.raydium.io/lock/cpmm/position',
                },
            }
            : {}),
    });
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
    return raydium;
};
exports.initSdk = initSdk;
const fetchTokenAccountData = async () => {
    const solAccountResp = await constant_1.CONNECTION.getAccountInfo(constant_1.OWNER.publicKey);
    const tokenAccountResp = await constant_1.CONNECTION.getTokenAccountsByOwner(constant_1.OWNER.publicKey, { programId: spl_token_1.TOKEN_PROGRAM_ID });
    const token2022Req = await constant_1.CONNECTION.getTokenAccountsByOwner(constant_1.OWNER.publicKey, { programId: spl_token_1.TOKEN_2022_PROGRAM_ID });
    const tokenAccountData = (0, raydium_sdk_v2_1.parseTokenAccountResp)({
        owner: constant_1.OWNER.publicKey,
        solAccountResp,
        tokenAccountResp: {
            context: tokenAccountResp.context,
            value: [...tokenAccountResp.value, ...token2022Req.value],
        },
    });
    return tokenAccountData;
};
exports.fetchTokenAccountData = fetchTokenAccountData;
