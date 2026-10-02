// AIM: Build a simple Merkle tree using hash functions that takes input from user.
//If import gives an error
//Use these two lines instead:
//const crypto = require("crypto");
//const readline = require("readline");

import crypto from "crypto";
import readline from "readline";

// Function to generate SHA-256 hash
function sha256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

// Function to build Merkle Tree
function buildMerkleTree(dataArray) {
    if (!dataArray || dataArray.length === 0)
        return null;

    let currentLevel = dataArray.map(item => sha256(item));

    console.log("\nLeaf Hashes:");
    console.log(currentLevel);

    while (currentLevel.length > 1) {
        const nextLevel = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = currentLevel[i + 1]
                ? currentLevel[i + 1]
                : left;

            nextLevel.push(sha256(left + right));
        }

        currentLevel = nextLevel;

        console.log("\nNext Level Hashes:");
        console.log(currentLevel);
    }

    return currentLevel[0];
}

// Read input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(
    "Enter Transactions separated by commas (e.g. A1, A2, A3): ",
    (input) => {

        const transactions = input
            .split(",")
            .map(tx => tx.trim())
            .filter(tx => tx.length > 0);

        if (transactions.length === 0) {
            console.log("No valid transactions entered.");
        } else {

            console.log("\nOriginal Data:");
            console.log(transactions);

            const merkleRoot = buildMerkleTree(transactions);

            console.log("\nFinal Merkle Root:");
            console.log(merkleRoot);
        }

        rl.close();
    }
);