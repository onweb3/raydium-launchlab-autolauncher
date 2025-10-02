import fs from "fs";
import path from "path";
import { imagePath } from "../constant";

const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

/**
 * Check if any valid image files exist in a directory
 * @param dirPath - Path to the directory
 * @returns boolean - true if at least one image exists
 */
export function hasValidImages(dirPath: string = imagePath): boolean {
    if (!fs.existsSync(dirPath)) return false;

    const files = fs.readdirSync(dirPath);
    return files.some(file => validExtensions.includes(path.extname(file).toLowerCase()));
}