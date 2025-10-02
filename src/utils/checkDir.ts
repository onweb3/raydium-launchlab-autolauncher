import fs from "fs";
import { imagePath, metadataDir, mintedFolder, tokensDir } from "../constant";

const directories = [imagePath, metadataDir, mintedFolder, tokensDir];

/**
 * Ensure required directories exist.
 * Creates them if they don't.
 */
export function ensureDirectories() {
    for (const dir of directories) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created missing directory: ${dir}`);
        } else {
            console.log(`✔️ Directory already exists: ${dir}`);
        }
    }
}