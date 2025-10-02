"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomImage = getRandomImage;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getRandomImage(folder, allowedExtensions) {
    const files = fs_1.default.readdirSync(folder).filter(file => {
        const ext = path_1.default.extname(file).toLowerCase();
        return allowedExtensions.includes(ext);
    });
    if (files.length === 0) {
        throw new Error("No valid image files found in the folder.");
    }
    const randomIndex = Math.floor(Math.random() * files.length);
    return path_1.default.join(folder, files[randomIndex]);
}
