const express = require('express');
const SupplyChainBlockchain = require('./blockchain');

const app = express();
const PORT = 3000;

// Replaced body-parser with native express parser
app.use(express.json());

// Initialize the blockchain network instance
const supplyChain = new SupplyChainBlockchain();

// Endpoint: View Full Chain Ledger
app.get('/blockchain', (req, res) => {
    res.status(200).json({ 
        chainLength: supplyChain.chain.length, 
        chain: supplyChain.chain 
    });
});

// Endpoint: Stage Custody Transaction (Passes through Smart Contract)
app.post('/transaction', (req, res) => {
    const { itemId, sender, receiver, status, location, telemetry } = req.body;

    if (!itemId || !sender || !receiver || !status || !location) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const tx = supplyChain.addTransaction(itemId, sender, receiver, status, location, telemetry);
        res.status(201).json({ 
            message: "Transaction verified by smart contract and staged.", 
            transaction: tx 
        });
    } catch (error) {
        // Correctly catches the 'CONTRACT VIOLATION' errors thrown by your smart contract
        res.status(400).json({ 
            status: "REJECTED BY SMART CONTRACT", 
            reason: error.message 
        });
    }
});

// Endpoint: Mine Blocks
app.post('/mine', (req, res) => {
    try {
        const newBlock = supplyChain.minePendingTransactions();
        if (!newBlock) {
            return res.status(400).json({ message: "No pending transactions to mine." });
        }
        res.status(200).json({ 
            message: "Staged transactions secured into block.", 
            block: newBlock 
        });
    } catch (error) {
        res.status(500).json({ error: "Mining failed.", reason: error.message });
    }
});

// Endpoint: Audit and Trace Asset Timeline
app.get('/trace/:itemId', (req, res) => {
    const history = supplyChain.getItemHistory(req.params.itemId);
    if (!history || history.length === 0) {
        return res.status(404).json({ error: "No records found for this item ID." });
    }
    res.status(200).json({ itemId: req.params.itemId, events: history });
});

// Endpoint: Verify Ledger Cryptographic Health
app.get('/validate', (req, res) => {
    const isValid = supplyChain.isChainValid();
    res.status(200).json({ 
        secure: isValid, 
        msg: isValid ? "Ledger is valid and untampered." : "CRITICAL WARNING: Tampering detected!" 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Supply Chain Ecosystem live at http://localhost:${PORT}`);
});



//1 )  { "itemId": "VACCINE-BATCH-A", "sender": "ORIGIN", "receiver": "Manufacturer", "status": "Bottled", "location": "Factory Room 4", "telemetry": { "temperature": 4.5 } }
//2 )  {"itemId": "VACCINE-BATCH-A", "sender": "Manufacturer", "receiver": "Distributor", "status": "Transit", "location": "Truck", "telemetry": {"temperature": 15.5}}
