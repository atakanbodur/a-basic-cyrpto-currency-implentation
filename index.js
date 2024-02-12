//sources: https://www.smashingmagazine.com/2020/02/cryptocurrency-blockchain-node-js/
const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class CryptoBlock{
    constructor(index, timestamp, transactions, precedingHash = " ") {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions; // Array of Transaction objects
        this.precedingHash = precedingHash;
        this.hash = this.computeHash();
        this.nonce = 0;
    }

    computeHash() {
        return SHA256(
            this.index +
            this.precedingHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
    }


    // The main purpose is to hash the string so that we will have a number of 0s(difficulty) as a result
    // ASCII by ChatGPT:
    //+------------------+       +------------------+       +------------------------+
    // | Initial Attempt  |       | Next Attempt     |       | Successful            |
    // | Nonce: 1         |       | Nonce: 2         |       | Nonce: X              |
    // | Hash: X5d4...    |  -->  | Hash: 3Fg8...    |  -->  | Hash: 0000AF...       |
    // | (No leading 0s)  |       | (No leading 0s)  |       | (Required leading 0s) |
    // +------------------+       +------------------+      +------------------------+
    proofOfWork(difficulty) {
        while (
            this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
            ) {
            this.nonce++;
            this.hash = this.computeHash();
        }
    }
}

class CryptoBlockchain{
    constructor(){
        this.blockchain = [this.startGenesisBlock()];
        this.difficulty = 1;
    }

    // In the case of this initial block, it does not have any preceding block to point to.
    // Therefore, a genesis block is usually hardcoded into the blockchain.
    startGenesisBlock(){
        return new CryptoBlock(0, "12/02/2024", "Initial Block in the Chain", "0");
    }

    obtainLatestBlock(){
        return this.blockchain[this.blockchain.length - 1];
    }

    addNewBlock(newBlock){
        newBlock.precedingHash = this.obtainLatestBlock().hash;
        //newBlock.hash = newBlock.computeHash();
        newBlock.proofOfWork(this.difficulty);
        this.blockchain.push(newBlock);
    }

    // check validity of each block
    checkChainValidity() {
        for (let i = 1; i < this.blockchain.length; i++) {
            const currentBlock = this.blockchain[i];
            const precedingBlock = this.blockchain[i - 1];

            if (currentBlock.hash !== currentBlock.computeHash()) {
                return false;
            }
            if (currentBlock.precedingHash !== precedingBlock.hash) return false;
        }
        return true;
    }

}

class BlockchainNetwork {
    constructor() {
        this.nodes = [];
    }

    addNode(blockchain) {
        this.nodes.push(blockchain);
    }

    broadcastLatestBlock(newBlock) {
        this.nodes.forEach(node => {
            if (node.blockchain[node.blockchain.length - 1].hash !== newBlock.hash) {
                node.addNewBlock(newBlock);
            }
        });
    }
}


// Initialize a simple blockchain network
let camacCoinNetwork = new BlockchainNetwork();

// Create two nodes and add them to the network
let node1 = new CryptoBlockchain();
let node2 = new CryptoBlockchain();

camacCoinNetwork.addNode(node1);
camacCoinNetwork.addNode(node2);

// Simulate wallets (In a real scenario, these would be more complex and secure)
let walletA = "walletAddressA";
let walletB = "walletAddressB";

// Create transactions
let transaction1 = new Transaction(walletA, walletB, 10);
let transaction2 = new Transaction(walletB, walletA, 5);

// Add a new block to the first blockchain
node1.addNewBlock(new CryptoBlock(node1.blockchain.length, Date.now().toString(), [transaction1, transaction2]));

// Broadcast this new block to all nodes in the network (simplified simulation)
camacCoinNetwork.broadcastLatestBlock(node1.obtainLatestBlock());

// Simulate mining/proof of work for the new blocks in all nodes
node2.addNewBlock(new CryptoBlock(node2.blockchain.length, Date.now().toString(), [transaction1]));

// Check the state of each blockchain
console.log("node1:", JSON.stringify(node1, null, 4));
console.log("node2:", JSON.stringify(node2, null, 4));

// Check if the blockchain is valid
console.log("node1 is valid:", node1.checkChainValidity());
console.log("node2: is valid:", node2.checkChainValidity());
