"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCsvValid = isCsvValid;
const fs_1 = __importDefault(require("fs"));
const constant_1 = require("../constant");
const sync_1 = require("csv-parse/sync");
function isCsvValid() {
    if (!fs_1.default.existsSync(constant_1.tokenInfoCsv))
        return false;
    const content = fs_1.default.readFileSync(constant_1.tokenInfoCsv, "utf-8");
    try {
        const records = (0, sync_1.parse)(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        return true;
    }
    catch {
        return false;
    }
}
