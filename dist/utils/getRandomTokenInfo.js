"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomTokenInfo = getRandomTokenInfo;
const sync_1 = require("csv-parse/sync");
const fs_1 = __importDefault(require("fs"));
function getRandomTokenInfo(csvPath) {
    const fileContent = fs_1.default.readFileSync(csvPath, "utf-8");
    const records = (0, sync_1.parse)(fileContent, {
        columns: true,
        skip_empty_lines: true
    });
    if (records.length === 0) {
        throw new Error("No token info found in CSV.");
    }
    const randomIndex = Math.floor(Math.random() * records.length);
    return records[randomIndex];
}
