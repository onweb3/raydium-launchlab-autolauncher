"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirectories = ensureDirectories;
const fs_1 = __importDefault(require("fs"));
const constant_1 = require("../constant");
const directories = [constant_1.imagePath, constant_1.metadataDir, constant_1.mintedFolder, constant_1.tokensDir];
/**
 * Ensure required directories exist.
 * Creates them if they don't.
 */
function ensureDirectories() {
    for (const dir of directories) {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created missing directory: ${dir}`);
        }
        else {
            console.log(`✔️ Directory already exists: ${dir}`);
        }
    }
}
