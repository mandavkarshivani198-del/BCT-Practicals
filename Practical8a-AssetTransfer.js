//Aim: Create and deploy a blockchain network using Hyperledger Fabric. 
'use strict';

//const { Contract } = require('fabric-contract-api');
import { Contract } from 'fabric-contract-api';

class AssetTransfer extends Contract {

    // 1. Initialize the ledger with default assets
    async InitLedger(ctx) {

        const assets = [
            {
                ID: 'asset1',
                Color: 'blue',
                Size: 5,
                Owner: 'Tom',
                AppraisedValue: 300
            },
            {
                ID: 'asset2',
                Color: 'red',
                Size: 10,
                Owner: 'Brad',
                AppraisedValue: 400
            }
        ];

        for (const asset of assets) {
            asset.docType = 'asset';

            await ctx.stub.putState(
                asset.ID,
                Buffer.from(JSON.stringify(asset))
            );
        }
    }

    // 2. CreateAsset - Issues a new asset after checking if it already exists
    async CreateAsset(ctx, id, color, size, owner, appraisedValue) {

        const exists = await this.AssetExists(ctx, id);

        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Color: color,
            Size: parseInt(size),
            Owner: owner,
            AppraisedValue: parseInt(appraisedValue),
            docType: 'asset'
        };

        await ctx.stub.putState(
            id,
            Buffer.from(JSON.stringify(asset))
        );

        return JSON.stringify(asset);
    }

    // 3. ReadAsset - Returns the asset stored in the world state
    async ReadAsset(ctx, id) {

        const assetJSON = await ctx.stub.getState(id);

        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }

        return assetJSON.toString();
    }

    // 4. UpdateAsset - Updates details of an existing asset
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {

        const exists = await this.AssetExists(ctx, id);

        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        const updatedAsset = {
            ID: id,
            Color: color,
            Size: parseInt(size),
            Owner: owner,
            AppraisedValue: parseInt(appraisedValue),
            docType: 'asset'
        };

        await ctx.stub.putState(
            id,
            Buffer.from(JSON.stringify(updatedAsset))
        );

        return JSON.stringify(updatedAsset);
    }

    // 5. TransferAsset - Updates only the owner field of an asset
    async TransferAsset(ctx, id, newOwner) {

        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);

        asset.Owner = newOwner;

        await ctx.stub.putState(
            id,
            Buffer.from(JSON.stringify(asset))
        );

        return JSON.stringify(asset);
    }

    // 6. DeleteAsset - Removes an asset completely from the world state
    async DeleteAsset(ctx, id) {

        const exists = await this.AssetExists(ctx, id);

        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        return await ctx.stub.deleteState(id);
    }

    // 7. AssetExists - Helper utility returns true when asset with given ID exists
    async AssetExists(ctx, id) {

        const assetJSON = await ctx.stub.getState(id);

        return assetJSON && assetJSON.length > 0;
    }

    // 8. GetAllAssets - Retrieves all assets currently stored in the world state
    async GetAllAssets(ctx) {

        const allResults = [];

        // Range query for all keys
        const iterator = await ctx.stub.getStateByRange("", "");

        let result = await iterator.next();

        while (!result.done) {

            const strValue = Buffer
                .from(result.value.value.toString())
                .toString('utf8');

            let record;

            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }

            allResults.push(record);

            result = await iterator.next();
        }

        return JSON.stringify(allResults);
    }
}

//module.exports = AssetTransfer;

export default AssetTransfer;