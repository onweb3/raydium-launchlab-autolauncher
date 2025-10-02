"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = upload;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constant_1 = require("../constant");
async function upload(filePath) {
    try {
        const buffer = fs_1.default.readFileSync(filePath);
        const blob = new Blob([buffer]);
        const fileNameOnly = path_1.default.basename(filePath);
        const file = new File([blob], fileNameOnly, { type: getMimeType(filePath) });
        const upload = await constant_1.PINATA.upload.public.file(file);
        return upload;
    }
    catch (error) {
        console.error("❌ Upload error:", error);
        throw error;
    }
}
function getMimeType(fileName) {
    const ext = path_1.default.extname(fileName).toLowerCase().slice(1);
    const mimeTypes = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        svg: "image/svg+xml",
        bmp: "image/bmp",
        tiff: "image/tiff",
        tif: "image/tiff",
        json: "application/json"
    };
    return mimeTypes[ext] || "application/octet-stream";
}
