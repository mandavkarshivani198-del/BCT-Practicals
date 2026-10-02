//AIM: BUILD A SIMPLE MERKLE TREE USING HASH FUNCTION
//const crypto = require('crypto');
import crypto from 'crypto';

// Helper function to hash any string using SHA-256
function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Function to construct the Merkle Tree and return the root hash
function buildMerkleTree(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        return null;
    }

    // Step 1: Hash all individual data blocks (Leaf Nodes)
    let currentLevel = dataArray.map(item => sha256(item));
    console.log("Leaf Hashes:", currentLevel);

    // Step 2: Keep combining hashes until only one hash remains
    while (currentLevel.length > 1) {
        const nextLevel = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];

            // Duplicate the last hash if odd number of nodes
            const right = currentLevel[i + 1]
                ? currentLevel[i + 1]
                : left;

            const parentHash = sha256(left + right);
            // Combine both hashes and hash again

            nextLevel.push(parentHash);
        }

        currentLevel = nextLevel;
        console.log("Next Level Hashes:", currentLevel);
    }

    return currentLevel[0]; // Final remaining hash is the Merkle Root
}

// Execution

// const transactions = ['A1', 'A2', 'A3', 'A4', 'A5'];
// const transactions = ['B1', 'B2', 'B3', 'B4'];
// const transactions = ["Bhavans College"];

const transactions = ["Hello", "World"];

console.log("Original Data:", transactions);

const merkleRoot = buildMerkleTree(transactions);

console.log("Final Merkle Root:", merkleRoot);