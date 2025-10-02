import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { API_URL } from "../constant";
import { initSdk } from "../raydium/raydium";
import { MintInfo } from "../types/raydium";

export async function checkForProfit() {
    const raydium = await initSdk();
    const ownerCreatedMintRes: { id: string; success: boolean; data: { rows: MintInfo[]; nextPageId?: string } } = (
        await axios.get(`${API_URL}/get/by/user?wallet=${raydium.ownerPubKey.toBase58()}&size=100`)
    ).data

    if (!ownerCreatedMintRes.data || !ownerCreatedMintRes.data.rows.length) {
        console.log('owner did not have any created mints')
        process.exit()
    } 

    console.log("total created tokens :", ownerCreatedMintRes.data.rows.length);
///wip
    
}