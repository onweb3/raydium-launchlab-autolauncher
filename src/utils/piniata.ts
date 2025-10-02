
import fs from "fs"
import path from "path";
import { PINATA } from "../constant";


export async function upload(filePath: string): Promise<any> {
    try {
        const buffer = fs.readFileSync(filePath);
        const blob = new Blob([buffer]);

        const fileNameOnly = path.basename(filePath);
        const file = new File([blob], fileNameOnly, { type: getMimeType(filePath) });

        const upload = await PINATA.upload.public.file(file);
        return upload;
    } catch (error) {
        console.error("❌ Upload error:", error);
        throw error;
    }
}



function getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase().slice(1);
    const mimeTypes: Record<string, string> = {
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