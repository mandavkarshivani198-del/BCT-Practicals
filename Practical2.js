//Create new block with data and test the block.
const SHA256 = require("sha256");

class Block {
    constructor(index, timestamp, data, prevHash = "") {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(
            this.index +
            this.prevHash +
            this.timestamp +
            JSON.stringify(this.data)
        ).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, "15/07/1947", "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.prevHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }
}

let firBitcoin = new Blockchain();

firBitcoin.addBlock(
    new Block(1, "10/02/2025", { amount: 400 })
);

firBitcoin.addBlock(
    new Block(2, "11/02/2025", { amount: 800 })
);

console.log(JSON.stringify(firBitcoin, null, 4));