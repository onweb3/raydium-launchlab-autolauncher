"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitMs = waitMs;
/**
 * Wait for a specified number of milliseconds
 * @param ms - Number of milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
async function waitMs(ms) {
    console.log("waiting", ms / 1000, "seconds");
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Usage: await waitMs(5000) // Wait 5 seconds
