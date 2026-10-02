// Aim: Create script to send Ethereum transactions programmatically using Web3.js/Node.js.
//const { Web3 } = require('web3');

import { Web3 } from 'web3';

// 1. Connect to a free, public Ethereum Test Network (Sepolia)
// No API keys or developer accounts required for this public URL.
const PUBLIC_PRC = 'https://ethereum-sepolia-rpc.publicnode.com';
const web3 = new Web3(PUBLIC_PRC);

// 2. Disposable Dummy Accounts. In a real application, these must be hidden.
const TEACHER_PRIVATE_KEY =
    '0xabc123e456f789a0123456789abcdef0123456789abcdef0123456789abcdef0';

// Dummy Placeholder
const TEACHER_ADDRESS =
    '0x9965503B1a059419742997A47e2537357F74010C';

// Matches the private key
const STUDENT_ADDRESS =
    '0x2111111111111111111111111111111111111111';

// Mock recipient address

async function runClassDemo() {

    try {

        console.log("Ethereum Transaction Classroom Demo");

        console.log(
            `Connecting to test network Via: ${PUBLIC_PRC}\n`
        );

        // Step 1: Fetch Network State
        // Checking the account sequence/nonce
        // The nonce prevents Replay Attacks by numbering transactions.
        const nonce = await web3.eth.getTransactionCount(
            TEACHER_ADDRESS,
            'pending'
        );

        console.log(
            `Current Account Nonce (Tx Count): ${nonce}`
        );

        // Step 2: Structure the Transaction Object
        // EIP-1559 Standard
        const txObject = {

            nonce: web3.utils.toHex(nonce),

            to: STUDENT_ADDRESS,

            value: web3.utils.toHex(
                web3.utils.toWei('0.001', 'ether')
            ), // Sending 0.001 Test ETH

            gasLimit: web3.utils.toHex(21000), // Standard limit for simple transfers

            maxPriorityFeePerGas: web3.utils.toHex(
                web3.utils.toWei('2', 'gwei')
            ), // Tip to the miner

            maxFeePerGas: web3.utils.toHex(
                web3.utils.toWei('30', 'gwei')
            ), // Max gas price limit

            type: '0x2' // Specifies modern EIP-1559 transaction type
        };

        console.log(
            "Transaction Object Structured Successfully"
        );

        // Step 3: Cryptographic Signing
        // This happens locally on your machine.
        // The private key never goes to the internet.
        console.log(
            "Signing transaction locally with the Private Key..."
        );

        const signedTx = await web3.eth.accounts.signTransaction(
            txObject,
            TEACHER_PRIVATE_KEY
        );

        console.log(
            "Transaction Signed! Cryptographic signature generated."
        );

        // Step 4: Network Broadcast
        // Note for the teacher: Since this dummy account has 0 ETH,
        // the network will reject it here.
        // This demonstrates the EVM validation process.
        console.log(
            "Broadcasting the signed transaction package to the peer-to-peer network..."
        );

        const receipt = await web3.eth.sendSignedTransaction(
            signedTx.rawTransaction
        );

        console.log(
            `Success! Tx Hash: ${receipt.transactionHash}`
        );

    } catch (error) {

        console.log(
            "\nNetwork Response (Validation Failed):"
        );

        // The blockchain validated the transaction
        // but aborted because of insufficient funds.
        console.log(`${error.message}`);

        console.log(
            "\nLesson: The network safely verified our signature " +
            "but stopped execution because the account has 0 test tokens. " +
            "\nThe network rejected the transaction."
        );
    }
}

runClassDemo();