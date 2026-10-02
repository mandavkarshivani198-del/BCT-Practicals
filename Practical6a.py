# Aim: Create a system that uses blockchain to verify the authenticity of documents.
# Variation 1: Basic Blockchain-Based Document Verification

import hashlib
import json
import time


class Block:

    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_dict = {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash
        }

        block_string = json.dumps(
            block_dict,
            sort_keys=True
        ).encode("utf-8")

        return hashlib.sha256(block_string).hexdigest()


class DocumentBlockchain:

    def __init__(self):
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        return Block(
            0,
            time.time(),
            "Genesis Block - Document Verification System",
            "0"
        )

    def get_latest_block(self):
        return self.chain[-1]

    def add_document(self, doc_name, doc_content):

        doc_hash = hashlib.sha256(
            doc_content.encode()
        ).hexdigest()

        block_data = {
            "document_name": doc_name,
            "document_hash": doc_hash,
            "status": "Registered"
        }

        new_block = Block(
            index=len(self.chain),
            timestamp=time.time(),
            data=block_data,
            previous_hash=self.get_latest_block().hash
        )

        self.chain.append(new_block)

        return doc_hash

    def verify_document(self, doc_content):

        target_hash = hashlib.sha256(
            doc_content.encode()
        ).hexdigest()

        for block in self.chain[1:]:

            if block.data.get("document_hash") == target_hash:
                return True, block.data, block.timestamp

        return False, None, None

    def is_chain_valid(self):

        for i in range(1, len(self.chain)):

            current = self.chain[i]
            previous = self.chain[i - 1]

            if current.hash != current.calculate_hash():
                return False

            if current.previous_hash != previous.hash:
                return False

        return True


if __name__ == "__main__":

    sys_blockchain = DocumentBlockchain()

    print("---[1] Initializing Blockchain Document Verification System---")

    invoice_content = "Invoice #10042 - Total Due:$1,500.00 - Vendor:Acme Corp"

    degree_content = "University Diploma - Student:Jane Doe - Major:Computer Science"

    inv_hash = sys_blockchain.add_document(
        "Acme_Invoice.txt",
        invoice_content
    )

    deg_hash = sys_blockchain.add_document(
        "Jane_Doe_Diploma.txt",
        degree_content
    )

    print(f"Registered 'Acme_Invoice.txt' | Hash: {inv_hash}")
    print(f"Registered 'Jane_Doe_Diploma.txt' | Hash: {deg_hash}\n")

    print("---[2] Verifying Untampered Original Document---")

    test_doc_1 = "Invoice #10042 - Total Due:$1,500.00 - Vendor:Acme Corp"

    is_valid, meta, t = sys_blockchain.verify_document(test_doc_1)

    print(f"Verification Result: {is_valid}")

    if is_valid:
        print(
            f"Metadata Match: '{meta['document_name']}' matched on ledger.\n"
        )

    print("---[3] Verifying Tampered/Fraudulent Document---")

    fake_doc_1 = "Invoice #10042 - Total Due:$1,300.00 - Vendor: Acme Corp"

    is_valid, meta, t = sys_blockchain.verify_document(fake_doc_1)

    print(f"Verification Result: {is_valid}")

    print(
        "Reason: System rejects it because the modified string "
        "generates an unlisted hash.\n"
    )

    print("---[4] Auditing Blockchain Integrity---")

    print(
        f"Is blockchain ledger structurally secure and untampered? "
        f"{sys_blockchain.is_chain_valid()}"
    )