
import bs58 from "bs58";
import "dotenv/config"
import { Cluster } from "../types/types";
export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(` Missing required environment variable: ${name}`);
    }
    return value.trim();
}

export function isValidBs58PrivateKey(value: string): boolean {
    try {
        const decoded = bs58.decode(value);
        // Solana private keys are usually 64 bytes (ed25519 secret key)
        return decoded.length === 64;
    } catch {
        return false;
    }
}

export function isValidBps(value: number, max: number): boolean {
    return Number.isInteger(value) && value >= 0 && value <= max;
}

export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}
export function requireCluster(): Cluster {
    const value = requireEnv("CLUSTER").toLowerCase();

    if (value !== "mainnet" && value !== "devnet") {
        throw new Error("CLUSTER must be either 'mainnet' or 'devnet'.");
    }

    return value as Cluster;
}