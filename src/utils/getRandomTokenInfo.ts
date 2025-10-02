import { TokenCsvRow } from "../types/token";
import { parse } from "csv-parse/sync";
import fs from "fs";

export function getRandomTokenInfo(csvPath: string): TokenCsvRow {
    const fileContent = fs.readFileSync(csvPath, "utf-8");

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    }) as TokenCsvRow[];

    if (records.length === 0) {
        throw new Error("No token info found in CSV.");
    }

    const randomIndex = Math.floor(Math.random() * records.length);
    return records[randomIndex];
}
