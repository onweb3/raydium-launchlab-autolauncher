"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEnv = requireEnv;
exports.isValidBs58PrivateKey = isValidBs58PrivateKey;
exports.isValidBps = isValidBps;
exports.isValidUrl = isValidUrl;
exports.requireCluster = requireCluster;
const bs58_1 = __importDefault(require("bs58"));
require("dotenv/config");
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(` Missing required environment variable: ${name}`);
    }
    return value.trim();
}
function isValidBs58PrivateKey(value) {
    try {
        const decoded = bs58_1.default.decode(value);
        // Solana private keys are usually 64 bytes (ed25519 secret key)
        return decoded.length === 64;
    }
    catch {
        return false;
    }
}
function isValidBps(value, max) {
    return Number.isInteger(value) && value >= 0 && value <= max;
}
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    }
    catch {
        return false;
    }
}
function requireCluster() {
    const value = requireEnv("CLUSTER").toLowerCase();
    if (value !== "mainnet" && value !== "devnet") {
        throw new Error("CLUSTER must be either 'mainnet' or 'devnet'.");
    }
    return value;
}
