import fs from "fs";
import { tokenInfoCsv } from "../constant";
import { parse } from "csv-parse/sync";
import { TokenCsvRow } from "../types/token";
export function isCsvValid(): boolean {
    if (!fs.existsSync(tokenInfoCsv)) return false;

    const content = fs.readFileSync(tokenInfoCsv, "utf-8");

    try {
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        
        return true;
    } catch {
        return false;
    }
}