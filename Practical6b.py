# Variation 2: Interactive Blockchain Document Verification System

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
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash
        }, sort_keys=True).encode()

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
            "status": "Verified"
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


# --- New Interactive Menu System ---

if __name__ == "__main__":

    sys_blockchain = DocumentBlockchain()

    # Pre-load the blockchain with one valid document for testing
    original_invoice = "Invoice #10042 - Total Due: $1,500.00 - Vendor: Acme Corp"

    sys_blockchain.add_document(
        "Acme_Invoice.txt",
        original_invoice
    )

    print("====================================================")
    print(" BLOCKCHAIN DOCUMENT VERIFIER (INTERACTIVE MODE) ")
    print("====================================================")

    print("System loaded with 1 registered document:")
    print(f'-> Content: "{original_invoice}"\n')

    print("Type 'exit' at any prompt to quit the program.\n")

    while True:

        print("Choose an option:")
        print("1. Register a NEW document to the blockchain")
        print("2. VERIFY an existing document string")

        choice = input(
            "Enter choice (1 or 2): "
        ).strip()

        if choice.lower() == 'exit':
            break

        if choice == "1":

            name = input(
                "\nEnter a name for this document (e.g., contract.txt): "
            )

            content = input(
                "Enter or paste the exact document text: "
            )

            doc_hash = sys_blockchain.add_document(
                name,
                content
            )

            print(
                f"SUCCESS: Document registered! "
                f"Generated SHA-256 Fingerprint:\n{doc_hash}\n"
            )

            print("-" * 50)

        elif choice == "2":

            content = input(
                "\nEnter/paste the text of the document you want to verify: "
            )

            is_valid, meta, timestamp = (
                sys_blockchain.verify_document(content)
            )

            print("\n--- VERIFICATION RESULT ---")

            if is_valid:

                print("STATUS: VALID AND UNTAMPERED!")

                print(
                    f"Document Name on Ledger: "
                    f"{meta['document_name']}"
                )

                print(
                    f"Timestamp Logged : "
                    f"{time.ctime(timestamp)}"
                )

            else:

                print("STATUS: INVALID / ALTERED!")

                print(
                    "Reason: This text does not match any registered "
                    "hash in the blockchain ledger."
                )

            print("-" * 50 + "\n")

        else:

            print("Invalid option. Please type 1 or 2.\n")