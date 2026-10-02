# Aim: Proof of Work (PoW) consensus algorithm.

import hashlib
import time


class Block:

    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = f"{self.index}{self.timestamp}{self.data}{self.previous_hash}{self.nonce}"
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty):
        target = "0" * difficulty

        print(f"Mining Block {self.index}...")

        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()

        print(f"Block Mined! Nonce: {self.nonce} | Hash: {self.hash}\n")


class Blockchain:

    def __init__(self, difficulty):
        self.difficulty = difficulty
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        return Block(0, time.time(), "Genesis Block", "0")

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, data):
        latest_block = self.get_latest_block()

        new_block = Block(
            index=latest_block.index + 1,
            timestamp=time.time(),
            data=data,
            previous_hash=latest_block.hash
        )

        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)


if __name__ == "__main__":

    DIFFICULTY = 4

    my_blockchain = Blockchain(difficulty=DIFFICULTY)

    my_blockchain.add_block(
        "Transaction: Alice sends 5 BCT to Bob"
    )

    my_blockchain.add_block(
        "Transaction: Bob sends 2.5 BCT to Charlie"
    )

    print("\nBlockchain:")

    for block in my_blockchain.chain:
        print(f"Block Index     : {block.index}")
        print(f"Timestamp       : {block.timestamp}")
        print(f"Data            : {block.data}")
        print(f"Previous Hash   : {block.previous_hash}")
        print(f"Hash            : {block.hash}")
        print(f"Nonce           : {block.nonce}")
        print("-" * 50)