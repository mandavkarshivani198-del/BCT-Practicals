const crypto = require('crypto');
const SupplyChainSmartContract = require('./contract');

class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        const blockString = JSON.stringify({
            index: this.index,
            timestamp: this.timestamp,
            transactions: this.transactions,
            previousHash: this.previousHash,
            nonce: this.nonce
        });
        return crypto.createHash('sha256').update(blockString).digest('hex');
    }

    mineBlock(difficulty) {
        const target = '0'.repeat(difficulty);
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class SupplyChainBlockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 2; 
        this.smartContract = new SupplyChainSmartContract();
        this.createGenesisBlock();
    }

    createGenesisBlock() {
        const genesisBlock = new Block(0, Date.now(), [{ info: "Genesis Block - System Initialized" }], "0");
        this.chain.push(genesisBlock);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(itemId, sender, receiver, status, location, telemetry = {}) {
        const newTx = { itemId, sender, receiver, status, location, telemetry, timestamp: Date.now() };
        
        // Execute smart contract rules
        this.smartContract.execute(newTx, this.chain);

        this.pendingTransactions.push(newTx);
        return newTx;
    }

    minePendingTransactions() {
        if (this.pendingTransactions.length === 0) return null;

        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        this.pendingTransactions = []; 
        return newBlock;
    }

    getItemHistory(itemId) {
        let history = [];
        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.itemId === itemId) {
                    history.push({ blockIndex: block.index, ...tx });
                }
            }
        }
        return history;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i];
            const previous = this.chain[i - 1];
            if (current.hash !== current.calculateHash()) return false;
            if (current.previousHash !== previous.hash) return false;
        }
        return true;
    }
}

module.exports = SupplyChainBlockchain;
