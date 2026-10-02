class SupplyChainSmartContract {
    constructor() {
        this.productRules = {
            "VACCINE-BATCH": { maxTemperature: 8.0 },
            "PERISHABLE-FOOD": { maxTemperature: 4.0 }
        };
    }

    execute(transaction, currentChain) {
        console.log(`\n📜 Smart Contract: Verifying Item ${transaction.itemId}...`);

        // Rule 1: Temperature Safeguard
        if (transaction.telemetry && transaction.telemetry.temperature !== undefined) {
            const temp = transaction.telemetry.temperature;
            for (const [key, rules] of Object.entries(this.productRules)) {
                if (transaction.itemId.startsWith(key) && temp > rules.maxTemperature) {
                    throw new Error(`CONTRACT VIOLATION: Temperature (${temp}°C) exceeded limit (${rules.maxTemperature}°C) for ${key}!`);
                }
            }
        }

        // Rule 2: Custody Chain Enforcement
        if (transaction.sender !== "ORIGIN") {
            const currentOwner = this.findCurrentOwner(transaction.itemId, currentChain);
            if (!currentOwner) {
                throw new Error(`CONTRACT VIOLATION: Item ${transaction.itemId} has no recorded origin.`);
            }
            if (currentOwner !== transaction.sender) {
                throw new Error(`CONTRACT VIOLATION: Unauthorized Transfer! '${transaction.sender}' does not own this item. Current custodian is '${currentOwner}'.`);
            }
        }

        console.log("✅ Smart Contract: Passed validation.");
        return true;
    }

    findCurrentOwner(itemId, chain) {
        let currentOwner = null;
        for (const block of chain) {
            for (const tx of block.transactions) {
                if (tx.itemId === itemId) {
                    currentOwner = tx.receiver;
                }
            }
        }
        return currentOwner;
    }
}

module.exports = SupplyChainSmartContract;
