"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTrades = checkTrades;
const axios_1 = __importDefault(require("axios"));
const constant_1 = require("../constant");
async function checkTrades(poolId) {
    const r = await axios_1.default.get(`${constant_1.API_URL}/trade?poolId=${poolId}&limit=50`);
    const data = r.data.data.rows;
    return data;
}
