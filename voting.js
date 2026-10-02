//const { ethers } = require("ethers");
//const fs = require("fs");
//const path = require("path");
//const solc = require("solc");
//const readline = require("readline");

import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import solc from "solc";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================================
// CRITICAL CREDENTIAL CONFIGURATION
// =========================================================================
const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const PRIVATE_KEY = "6d71ad5277a82774e258f52bf81f0026e378aaead28a3cb8f66e29ce8211d43e";

// Paste your successful deployed contract address inside these quotes!
let contractAddress = "";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

async function main() {

    if (PRIVATE_KEY.includes("YOUR_")) {
        console.error("\nINITIALIZATION ERROR: Update your private key.");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(
        SEPOLIA_RPC_URL,
        {
            name: "sepolia",
            chainId: 11155111
        },
        {
            staticNetwork: true
        }
    );

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`\nConnected Wallet Address: ${wallet.address}`);

    // DYNAMIC LOCAL COMPILATION ENGINE
    console.log("Compiling 'Voting.sol' locally...");

    const contractPath = path.resolve(__dirname, "Voting.sol");

    if (!fs.existsSync(contractPath)) {
        console.error("ERROR: 'Voting.sol' file not found.");
        process.exit(1);
    }

    const source = fs.readFileSync(contractPath, "utf8");

    const input = {
        language: "Solidity",
        sources: {
            "Voting.sol": {
                content: source
            }
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["abi", "evm.bytecode.object"]
                }
            }
        }
    };

    const output = JSON.parse(
        solc.compile(JSON.stringify(input))
    );

    if (output.errors) {
        output.errors.forEach((err) => {
            if (err.severity === "error") {
                console.error(
                    "Solidity Compilation Failure:",
                    err.message
                );
                process.exit(1);
            }
        });
    }

    const contractData = output.contracts["Voting.sol"]["Voting"];

    const contractABI = contractData.abi;
    const bytecode = contractData.evm.bytecode.object;

    // AUTOMATED SYSTEM DEPLOYMENT
    if (!contractAddress || contractAddress.includes("YOUR_")) {

        console.log(
            "\nNo contract address detected. Deploying new contract..."
        );

        const factory = new ethers.ContractFactory(
            contractABI,
            bytecode,
            wallet
        );

        const contract = await factory.deploy([
            "Alice",
            "Bob",
            "Charlie"
        ]);

        console.log(
            "Awaiting network confirmation... Please wait."
        );

        await contract.waitForDeployment();

        contractAddress = await contract.getAddress();

        console.log("\n==================================================");
        console.log("COMPILATION & DEPLOYMENT COMPLETE!");
        console.log(`Deployed Contract Address: ${contractAddress}`);
        console.log("==================================================");
    }

    const votingContract = new ethers.Contract(
        contractAddress,
        contractABI,
        wallet
    );

    console.log(
        `Connected to contract address: ${contractAddress}`
    );

    // Core Interactive Program
    while (true) {

        console.log("\n==================================================");
        console.log("VOTING SYSTEM");
        console.log("==================================================");

        try {

            const total = await votingContract.candidatesCount();

            if (Number(total) === 0) {

                console.log(
                    "No candidates recorded on blockchain."
                );

            } else {

                for (let i = 1; i <= Number(total); i++) {

                    const cand = await votingContract.candidates(i);

                    console.log(
                        `[ID: ${cand.id.toString()}] ${cand.name.padEnd(10)} — Votes: ${cand.voteCount.toString()}`
                    );
                }
            }

        } catch (err) {

            console.error(
                "Error fetching blockchain data:",
                err.message
            );
        }

        console.log("==================================================");
        console.log("1. Submit a Vote");
        console.log("2. Refresh Data");
        console.log("3. Exit");
        console.log("==================================================");

        const choice = await askQuestion(
            "\nEnter your choice (1-3): "
        );

        if (choice === "1") {

            const idInput = await askQuestion(
                "Enter Candidate ID: "
            );

            const targetId = parseInt(idInput);

            if (isNaN(targetId) || targetId <= 0) {

                console.log(
                    "Invalid candidate ID."
                );

                continue;
            }

            try {

                console.log(
                    "Sending vote transaction..."
                );

                const txn = await votingContract.vote(targetId);

                console.log(
                    `Transaction sent! Hash: ${txn.hash}`
                );

                console.log(
                    "Waiting for confirmation..."
                );

                await txn.wait();

                console.log(
                    "Vote successfully recorded on blockchain!"
                );

            } catch (err) {

                if (err.reason) {

                    console.error(
                        `Transaction reverted: ${err.reason}`
                    );

                } else if (
                    err.message &&
                    err.message.includes("insufficient funds")
                ) {

                    console.error(
                        "Wallet does not have enough Sepolia ETH for gas."
                    );

                } else {

                    console.error(
                        `Transaction failed: ${err.message}`
                    );
                }
            }

        } else if (choice === "2") {

            console.log(
                "Refreshing blockchain data..."
            );

            continue;

        } else if (choice === "3") {

            console.log(
                "Exiting voting system."
            );

            rl.close();

            break;

        } else {

            console.log(
                "Invalid choice. Please select 1, 2, or 3."
            );
        }
    }
}

main().catch((error) => {

    console.error(
        "SYSTEM RUNTIME ERROR:",
        error
    );

    process.exit(1);
});