const readline = require('readline');
const AssetTransfer = require('./AssetTransfer');

// 1. In-memory storage acting as our blockchain database
const mockState = {};
const mockCtx = {
    stub: {
        putState: async (key, value) => { mockState[key] = value.toString(); },
        getState: async (key) => mockState[key] ? Buffer.from(mockState[key]) : Buffer.alloc(0),
        deleteState: async (key) => { delete mockState[key]; },
        getStateByRange: async () => {
            const keys = Object.keys(mockState).sort();
            let index = 0;
            return {
                next: async () => {
                    if (index < keys.length) {
                        const currentKey = keys[index++];
                        return { value: { value: Buffer.from(mockState[currentKey]) }, done: false };
                    }
                    return { done: true };
                }
            };
        }
    }
};

// Setup command-line prompt interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));
const contract = new AssetTransfer();

async function main() {
    // Populate with default ledger data first
    await contract.InitLedger(mockCtx);
    console.log("=========================================");
    console.log("  Fabric Smart Contract CLI Simulator    ");
    console.log("=========================================\n");

    while (true) {
        console.log("Choose an operation:");
        console.log("1. Create New Asset");
        console.log("2. Read / View Asset");
        console.log("3. Transfer Asset Owner");
        console.log("4. View All Assets");
        console.log("5. Exit");

        const choice = await askQuestion("\nEnter option number (1-5): ");
        console.log("\n-----------------------------------------");

        try {
            if (choice === '1') {
                const id = await askQuestion("Enter Asset ID (e.g. asset3): ");
                const color = await askQuestion("Enter Color: ");
                const size = await askQuestion("Enter Size (number): ");
                const owner = await askQuestion("Enter Owner Name: ");
                const value = await askQuestion("Enter Appraised Value (number): ");

                console.log("\n[Processing Blockchain Transaction...]");
                const result = await contract.CreateAsset(mockCtx, id, color, size, owner, value);
                console.log("Success! Created Asset Data:", JSON.parse(result));

            } else if (choice === '2') {
                const id = await askQuestion("Enter Asset ID to lookup: ");
                
                console.log("\n[Querying Ledger...]");
                const result = await contract.ReadAsset(mockCtx, id);
                console.log("Asset Found:", JSON.parse(result));

            } else if (choice === '3') {
                const id = await askQuestion("Enter Target Asset ID: ");
                const newOwner = await askQuestion("Enter New Owner Name: ");

                console.log("\n[Executing State Transfer...]");
                const result = await contract.TransferAsset(mockCtx, id, newOwner);
                console.log("Transfer Confirmed:", JSON.parse(result));

            } else if (choice === '4') {
                console.log("[Scanning World State DB...]");
                const result = await contract.GetAllAssets(mockCtx);
                console.log("Current Ledger Inventory:\n", JSON.parse(result));

            } else if (choice === '5') {
                console.log("Exiting Simulator. Goodbye!");
                rl.close();
                break;
            } else {
                console.log("⚠️ Invalid option. Please select 1 through 5.");
            }
        } catch (error) {
            // This safely catches smart contract rules (like duplicate IDs or missing assets)
            console.log("🛑 Transaction Rejected:", error.message);
        }
        console.log("-----------------------------------------\n");
    }
}

main().catch(console.error);