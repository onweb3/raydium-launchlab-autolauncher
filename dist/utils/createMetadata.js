"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMetaData = createMetaData;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const piniata_1 = require("./piniata");
const web3_js_1 = require("@solana/web3.js");
const constant_1 = require("../constant");
const getRandomTokenInfo_1 = require("./getRandomTokenInfo");
const getRandomImage_1 = require("./getRandomImage");
async function createMetaData() {
    const imagePatha = (0, getRandomImage_1.getRandomImage)(constant_1.imagePath, [".png", ".jpg", ".jpeg", ".webp", ".gif"]);
    console.log("🖼️ Selected image:", constant_1.imagePath);
    const imageUpload = await (0, piniata_1.upload)(imagePatha);
    const imageUri = `https://ipfs.io/ipfs/${imageUpload.cid}`;
    if (!fs_1.default.existsSync(constant_1.metadataDir))
        fs_1.default.mkdirSync(constant_1.metadataDir);
    const tokenMeta = (0, getRandomTokenInfo_1.getRandomTokenInfo)(constant_1.tokenInfoCsv);
    const metadata = {
        name: tokenMeta.name,
        symbol: tokenMeta.symbol,
        description: tokenMeta?.description,
        createdOn: "https://gemhunt.fun",
        image: imageUri
    };
    const mint = web3_js_1.Keypair.generate();
    const metadataFilename = mint.publicKey.toString() + ".json";
    const metadataPath = path_1.default.join(constant_1.metadataDir, metadataFilename);
    fs_1.default.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log("📝 Metadata saved at:", metadataPath);
    // Step 7: Upload metadata to IPFS
    const metadataUpload = await (0, piniata_1.upload)(metadataPath);
    const metadataUri = `https://ipfs.io/ipfs/${metadataUpload.cid}`;
    console.log("📦 Metadata uploaded:", metadataUri);
    // Step 8: Create token using the new wallet
    const tokenInfo = {
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataUri,
        mint: mint
    };
    const tokenDataPath = path_1.default.join(constant_1.tokensDir, metadataFilename);
    fs_1.default.writeFileSync(tokenDataPath, JSON.stringify(tokenInfo, null, 2));
    return tokenInfo;
}
