import hashlib
import time

class Block:
    def __init__(self, index, data, previous_hash):
        self.index = index
        self.timestamp = time.time()
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.mine()

    def mine(self):
        print(f"Mining Block {self.index}...")
        while True:
            text = f"{self.index}{self.timestamp}{self.data}{self.previous_hash}{self.nonce}"
            self.hash = hashlib.sha256(text.encode()).hexdigest()

            if self.hash[:4] == "0000":
                print(f"Block Mined! Nonce: {self.nonce} | Hash: {self.hash}\n")
                break
            self.nonce += 1


class Blockchain:
    def __init__(self):
        self.chain = [Block(0, "Genesis Block", "0")]

    def add_block(self, data):
        last = self.chain[-1]
        self.chain.append(Block(len(self.chain), data, last.hash))


bc = Blockchain()

bc.add_block("Transaction: Alice sends 5 BCT to Bob")
bc.add_block("Transaction: Bob sends 2.5 BCT to Charlie")

print("\nBlockchain:")

for block in bc.chain:
    print(f"Block Index     : {block.index}")
    print(f"Timestamp       : {block.timestamp}")
    print(f"Data            : {block.data}")
    print(f"Previous Hash   : {block.previous_hash}")
    print(f"Hash            : {block.hash}")
    print(f"Nonce           : {block.nonce}")
    print("-" * 50)