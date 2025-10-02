"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidImages = hasValidImages;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constant_1 = require("../constant");
const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
/**
 * Check if any valid image files exist in a directory
 * @param dirPath - Path to the directory
 * @returns boolean - true if at least one image exists
 */
function hasValidImages(dirPath = constant_1.imagePath) {
    if (!fs_1.default.existsSync(dirPath))
        return false;
    const files = fs_1.default.readdirSync(dirPath);
    return files.some(file => validExtensions.includes(path_1.default.extname(file).toLowerCase()));
}
