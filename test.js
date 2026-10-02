//const AssetTransfer = require('./AssetTransfer');
import AssetTransfer from './Practical8a-AssetTransfer.js';

// 1. Simulate Hyperledger Fabric's World State database in-memory
const mockState = {};

const mockCtx = {

    stub: {

        // Simulates saving bytes to a blockchain state database
        putState: async (key, value) => {
            mockState[key] = value.toString();
        },

        // Simulates fetching bytes from the database
        getState: async (key) => {
            return mockState[key]
                ? Buffer.from(mockState[key])
                : Buffer.alloc(0);
        },

        // Simulates removing a key from active state
        deleteState: async (key) => {
            delete mockState[key];
        },

        // Simulates the GetAllAssets range scanner
        getStateByRange: async (startKey, endKey) => {

            const keys = Object.keys(mockState).sort();
            let index = 0;

            return {

                next: async () => {

                    if (index < keys.length) {

                        const currentKey = keys[index++];

                        return {
                            value: {
                                key: currentKey,
                                value: Buffer.from(
                                    mockState[currentKey]
                                )
                            },
                            done: false
                        };
                    }

                    return {
                        done: true
                    };
                }
            };
        }
    }
};


// 2. Run your transactions sequentially
async function testBlockchainLifecycle() {

    const contract = new AssetTransfer();

    console.log(
        "=== 1. Initializing Ledger with default records ==="
    );

    await contract.InitLedger(mockCtx);

    console.log(
        "Initialization Complete.\n"
    );


    console.log(
        "=== 2. Reading 'asset1' ==="
    );

    const asset1 = await contract.ReadAsset(
        mockCtx,
        'asset1'
    );

    console.log(
        "Result:",
        asset1,
        "\n"
    );


    console.log(
        "=== 3. Creating a new asset ('asset3') ==="
    );

    await contract.CreateAsset(
        mockCtx,
        'asset3',
        'green',
        '15',
        'Alice',
        '600'
    );

    console.log(
        "Asset 3 successfully registered.\n"
    );


    console.log(
        "=== 4. Attempting to create duplicate 'asset3' (Error test) ==="
    );

    try {

        await contract.CreateAsset(
            mockCtx,
            'asset3',
            'yellow',
            '5',
            'Bob',
            '100'
        );

    } catch (error) {

        console.log(
            "Caught expected safety block:",
            error.message,
            "\n"
        );
    }


    console.log(
        "=== 5. Transferring ownership of 'asset2' to 'Charlie' ==="
    );

    const transferred = await contract.TransferAsset(
        mockCtx,
        'asset2',
        'Charlie'
    );

    console.log(
        "Updated Asset:",
        transferred,
        "\n"
    );


    console.log(
        "=== 6. Fetching ALL active assets on our simulated ledger ==="
    );

    const allAssets = await contract.GetAllAssets(
        mockCtx
    );

    console.log(
        JSON.parse(allAssets)
    );
}


testBlockchainLifecycle().catch(console.error);