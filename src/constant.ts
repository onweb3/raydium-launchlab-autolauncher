
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { isValidBs58PrivateKey, isValidUrl, requireCluster, requireEnv } from "./utils/helper";
import bs58 from "bs58";
import { TxVersion } from "@raydium-io/raydium-sdk-v2";
import { Cluster } from "./types/types";
import { PinataSDK } from "pinata";
import path from "path";
import "dotenv/config"


const CREATOR_KEY = requireEnv("CREATOR_KEY");
if (!isValidBs58PrivateKey(CREATOR_KEY)) {
    throw new Error("CREATOR_KEY must be a valid base58-encoded private key (64 bytes).");
}


const RPC_URL = requireEnv("RPC_URL");
if (!isValidUrl(RPC_URL)) {
    throw new Error(" RPC_URL must be a valid HTTP/HTTPS URL.");
}

const OWNER: Keypair = Keypair.fromSecretKey(bs58.decode(CREATOR_KEY))
const CONNECTION = new Connection(RPC_URL);
const txVersion = TxVersion.V0
const CLUSTER: Cluster = requireCluster();
const WAIT_FOR_SELL = Number(requireEnv("WAIT_BEFORE_SELL"))

const FEE_RECIEVER = new PublicKey("6foZfeTXxh8P7AndfeTzpmhJzXY7mTNPHBfF7E7B3avr");
const DEVNET_PROGRAM = new PublicKey("DRay6fNdQ5J82H7xV6uq2aV3mNrUZ1J4PgSKsWgptcm6");
const MAINNET_PROGRAM = new PublicKey("LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj");
const CPCONFIG_DEVNET = new PublicKey("3aBCy6rdPGK3w5EQzaRxmTgJHKFHQusMMEzBJ8q6o17R");
const CPCONFIG_MAINNET = new PublicKey("JDAmYWR63gixwAR6Q4f7ynyaDQMVJXZaMZCxBuZsUWTC");

const CPCONFIG: PublicKey = CLUSTER === "mainnet" ? CPCONFIG_MAINNET : CPCONFIG_DEVNET
const PROGRAM_ID: PublicKey =
    CLUSTER === "mainnet" ? MAINNET_PROGRAM : DEVNET_PROGRAM;

const PINATA_JWT: string = requireEnv("PINATA_JWT");
const GATEWAY_URL: string = requireEnv("GATEWAY_URL");

const PINATA = new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: GATEWAY_URL
})

const MAINNET_API_URL = "https://launch-mint-v1.raydium.io"
const DEVNET_API_URL = "https://launch-mint-v1-devnet.raydium.io"

const API_URL = CLUSTER === "mainnet" ? MAINNET_API_URL : DEVNET_API_URL

const buyAmount = requireEnv("BUY_AMOUNT");
const SLIPPAGE = parseInt(requireEnv("SLIPPAGE"), 10);
const imagePath = path.join(__dirname, "../resource", "images");
const metadataDir = path.join(__dirname, "../resource", "metadata");
const mintedFolder = path.join(__dirname, "../resource", "minted");
const tokenInfoCsv = path.join(__dirname, "../resource", "tokensInfo.csv");
const tokensDir = path.join(__dirname, "../resource", "tokens");
const mintFee = 0.025 + 0.0033 //metaplex+solana gas fee + priority fee
const feeBalance = Number(buyAmount) + Number(mintFee)

export {
    OWNER,
    CONNECTION,
    txVersion,
    CLUSTER,
    FEE_RECIEVER,
    CPCONFIG,
    PROGRAM_ID,
    PINATA,
    buyAmount,
    SLIPPAGE,
    imagePath,
    metadataDir,
    tokenInfoCsv,
    GATEWAY_URL,
    tokensDir,
    API_URL,
    feeBalance,
    mintedFolder,
    WAIT_FOR_SELL
};
