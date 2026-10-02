# Aim: Mining block via Postman

import hashlib
import json
from time import time
from flask import Flask, jsonify


class Blockchain:

    def __init__(self):
        self.chain = []
        self.current_transactions = []
        self.create_block(proof=100, previous_hash='1')

    def create_block(self, proof, previous_hash):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'transactions': self.current_transactions,
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1])
        }

        self.current_transactions = []
        self.chain.append(block)

        return block

    @property
    def last_block(self):
        return self.chain[-1]

    @staticmethod
    def hash(block):
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    def proof_of_work(self, last_proof):
        """Simple Proof of Work Algorithm"""

        proof = 0

        while not self.valid_proof(last_proof, proof):
            proof += 1

        return proof

    @staticmethod
    def valid_proof(last_proof, proof):
        guess = f'{last_proof}{proof}'.encode()
        guess_hash = hashlib.sha256(guess).hexdigest()

        return guess_hash[:4] == "0000"  # Difficulty level: 4 leading zeros


# Initialize Flask web application
app = Flask(__name__)

blockchain = Blockchain()


@app.route('/mine', methods=['GET'])
def mine():

    # 1. Run the proof of work algorithm
    last_block = blockchain.last_block
    last_proof = last_block['proof']

    proof = blockchain.proof_of_work(last_proof)

    # 2. Reward the miner
    blockchain.current_transactions.append({
        'sender': "0",
        'recipient': "miner_wallet_address_xyz",
        'amount': 1,
    })

    # 3. Create the new block
    previous_hash = blockchain.hash(last_block)

    block = blockchain.create_block(
        proof,
        previous_hash
    )

    response = {
        'message': "New Block Mined Successfully!",
        'index': block['index'],
        'transactions': block['transactions'],
        'proof': block['proof'],
        'previous_hash': block['previous_hash']
    }

    return jsonify(response), 200


@app.route('/chain', methods=['GET'])
def full_chain():

    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
    }

    return jsonify(response), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)