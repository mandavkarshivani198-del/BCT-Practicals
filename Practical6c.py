# Variation 3: Real-File Blockchain-Based Document Verification System

import hashlib
import json
import time
import os


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

    def add_document(self, doc_name, file_bytes):

        # Generate SHA-256 hash directly from raw file bytes
        doc_hash = hashlib.sha256(file_bytes).hexdigest()

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

    def verify_document(self, file_bytes):

        target_hash = hashlib.sha256(file_bytes).hexdigest()

        for block in self.chain[1:]:

            if block.data.get("document_hash") == target_hash:
                return True, block.data, block.timestamp

        return False, None, None


if __name__ == "__main__":

    sys_blockchain = DocumentBlockchain()

    print("====================================================")
    print(" REAL FILE BLOCKCHAIN VERIFIER SYSTEM ")
    print("====================================================")

    print("Type 'exit' at any prompt to quit the program.\n")

    while True:

        print("Choose an option:")
        print("1. REGISTER a real file to the blockchain")
        print("2. VERIFY an existing file's authenticity")

        choice = input(
            "Enter choice (1 or 2): "
        ).strip()

        if choice.lower() == 'exit':
            break

        if choice in ["1", "2"]:

            file_path = input(
                "Drag & drop your file here or paste its path: "
            ).strip()

            # Clean up Windows path formatting if user wrapped it in quotes
            file_path = file_path.strip('\'"')

            if not os.path.exists(file_path):

                print(
                    "ERROR: File not found! "
                    "Please check the file path.\n"
                )

                continue

            try:

                # Read file as raw binary bytes
                # Supports text, PDFs, images, etc.
                with open(file_path, "rb") as f:
                    file_bytes = f.read()

                file_name = os.path.basename(file_path)

                if choice == "1":

                    doc_hash = sys_blockchain.add_document(
                        file_name,
                        file_bytes
                    )

                    print(
                        "\nSUCCESS: File anchored to blockchain ledger!"
                    )

                    print(f"Filename: {file_name}")

                    print(
                        f"SHA-256 Fingerprint: {doc_hash}\n"
                    )

                    print("-" * 50)

                elif choice == "2":

                    is_valid, meta, timestamp = (
                        sys_blockchain.verify_document(file_bytes)
                    )

                    print("\n--- VERIFICATION RESULT ---")

                    if is_valid:

                        print("STATUS: VALID AND UNTAMPERED!")

                        print(
                            f"Original Filename: "
                            f"{meta['document_name']}"
                        )

                        print(
                            f"Registered On : "
                            f"{time.ctime(timestamp)}"
                        )

                    else:

                        print("STATUS: INVALID / ALTERED!")

                        print(
                            "Reason: File signature does not match "
                            "any block on the ledger."
                        )

                    print("-" * 50 + "\n")

            except Exception as e:

                print(
                    f"Error processing file: {e}\n"
                )

        else:

            print(
                "Invalid option. Please type 1 or 2.\n"
            )