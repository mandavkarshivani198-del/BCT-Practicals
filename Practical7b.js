// Aim: Create script to send Ethereum transactions programmatically using Web3.js/Nodejs.
// (Create and Send Ethereum Transaction Using Online Wallet, Dummy Tokens)

// 1. Import the Web3 library
import { Web3 } from 'web3';

async function sendTransactionDemo() {

    // 2. DEFINE A MULTI-ENDPOINT FALLBACK LIST
    // If one public node blocks or drops the connection, the code jumps to the next one instantly!
    const fallbackRPCs = [
        'https://1rpc.io',
        'https://ankr.com',
        'https://ethereum-sepolia-rpc.publicnode.com',
        'https://endpoints.omniatech.io/v1/eth/sepolia/public'
    ];

    let web3;
    let successfulURL = '';

    console.log('--- Establishing Secure Blockchain Connection ---');

    // Cycle through endpoints until a working JSON response is received
    for (const url of fallbackRPCs) {
        try {
            const tempWeb3 = new Web3(url);

            // Quick check to see if the endpoint natively returns numbers instead of HTML text
            await tempWeb3.eth.getBlockNumber();

            web3 = tempWeb3;
            successfulURL = url;
            break;

        } catch (e) {
            console.log(`Route skipped: ${url} (Connection blocked or invalid response)`);
        }
    }

    if (!web3) {
        console.error('\nCRITICAL: All public routes are blocked by your local network or firewall.');
        console.log('TIP FOR TEACHER: Turn off your network VPN or switch to a mobile hotspot to clear local restrictions.');
        return;
    }

    console.log(`Connection Established via: ${successfulURL}\n`);

    // 3. Setup your funded wallet credentials
    const senderPrivateKey = '0xb4de2881a7622ca05cccbc34125c0e9dc9387db81fae769ef0c27457c5aa225b';

    // Derive parameters cleanly
    const account = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
    const senderAddress = account.address;

    const receiverAddress = '0x07b1977010CB977761D95B14bebCac2215B08818';

    console.log(`Sender Address:   ${senderAddress}`);
    console.log(`Receiver Address: ${receiverAddress}\n`);

    try {
        console.log('Fetching blockchain network metrics...');

        const txCount = await web3.eth.getTransactionCount(senderAddress);
        const networkGasPrice = await web3.eth.getGasPrice();

        console.log(`Current Account Nonce:     ${txCount}`);
        console.log(`Current Network Gas Price: ${networkGasPrice} Wei`);

        // 4. Build the Clean Transaction Object
        const txObject = {
            nonce: txCount,
            to: receiverAddress,
            value: web3.utils.toWei('0.001', 'ether'),
            gasLimit: 21000,
            gasPrice: networkGasPrice,
            chain: 'sepolia'
        };

        console.log('\n--- Prepared Transaction Structure ---');
        console.log(txObject);

        // 5. Sign the Transaction locally
        console.log('\nSigning transaction structure...');

        const signedTx = await web3.eth.accounts.signTransaction(
            txObject,
            senderPrivateKey
        );

        // 6. Broadcast the Transaction to the Test Network
        console.log('Broadcasting transaction to the blockchain...');

        const receipt = await web3.eth.sendSignedTransaction(
            signedTx.rawTransaction
        );

        console.log('\nSUCCESS! TRANSACTION PASSED THE EVM!');
        console.log('===================================================');
        console.log(`Transaction Hash: ${receipt.transactionHash}`);
        console.log(`Block Number:     ${receipt.blockNumber}`);
        console.log(`View Status On:   https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
        console.log('===================================================');

    } catch (error) {
        console.error('\nExecution failed:', error.message);
    }
}

sendTransactionDemo();