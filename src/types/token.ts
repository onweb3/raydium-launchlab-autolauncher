import { Keypair } from "@solana/web3.js";

export interface TokenCsvRow {
    name: string;
    symbol: string;
    description?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
}
export interface TokenInfo {
    name: string;
    symbol: string;
    uri: string;
    mint: Keypair;
}
