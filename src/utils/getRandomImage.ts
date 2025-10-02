import fs from "fs";
import path from "path";
export function getRandomImage(folder: string, allowedExtensions: string[]): string {
    const files = fs.readdirSync(folder).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return allowedExtensions.includes(ext);
    });

    if (files.length === 0) {
        throw new Error("No valid image files found in the folder.");
    }

    const randomIndex = Math.floor(Math.random() * files.length);
    return path.join(folder, files[randomIndex]);
}