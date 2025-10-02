import fs from "fs";
import path from "path";
import { upload } from "./piniata";
import { Keypair } from "@solana/web3.js";
import { GATEWAY_URL, imagePath, metadataDir, tokenInfoCsv, tokensDir } from "../constant";
import { getRandomTokenInfo } from "./getRandomTokenInfo";
import { getRandomImage } from "./getRandomImage";
import { TokenInfo } from "../types/token";
export async function createMetaData() {
    const imagePatha = getRandomImage(imagePath, [".png", ".jpg", ".jpeg", ".webp", ".gif"]);
    console.log("🖼️ Selected image:", imagePath);

   
    const imageUpload = await upload(imagePatha);
    const imageUri = `https://ipfs.io/ipfs/${imageUpload.cid}`;
    if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir);
    const tokenMeta = getRandomTokenInfo(tokenInfoCsv);
    const metadata = {
        name: tokenMeta.name,
        symbol: tokenMeta.symbol,
        description: tokenMeta?.description,
        createdOn:"https://gemhunt.fun",
        image: imageUri
    };
    const mint = Keypair.generate();
    const metadataFilename = mint.publicKey.toString() + ".json";
    const metadataPath = path.join(metadataDir, metadataFilename);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log("📝 Metadata saved at:", metadataPath);

    // Step 7: Upload metadata to IPFS
    const metadataUpload = await upload(metadataPath);
    const metadataUri = `https://ipfs.io/ipfs/${metadataUpload.cid}`;
    console.log("📦 Metadata uploaded:", metadataUri);

    // Step 8: Create token using the new wallet
    const tokenInfo: TokenInfo = {
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataUri,
        mint: mint
    };
    const tokenDataPath = path.join(tokensDir, metadataFilename);
    fs.writeFileSync(tokenDataPath, JSON.stringify(tokenInfo, null, 2));

    return tokenInfo
    
}