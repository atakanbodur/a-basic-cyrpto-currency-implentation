//sources: https://www.smashingmagazine.com/2020/02/cryptocurrency-blockchain-node-js/

const SHA256 = require('crypto-js/sha256');

class CryptoBlock{
    constructor(index, timestamp, data, precedingHash=" "){
        // unique number that tracks the position of every block in the entire blockchain
        this.index = index;
        // record of the time of occurrence of each completed transaction
        this.timestamp = timestamp;
        // data about the completed transactions
        // sender details, recipient’s details, and quantity transacted
        this.data = data;
        //points to the hash of the preceding block in the blockchain
        this.precedingHash = precedingHash;
        this.hash = this.computeHash();
        this.nonce = 0;
    }

    computeHash() {
        return SHA256(
            this.index +
            this.precedingHash +
            this.timestamp +
            JSON.stringify(this.data) +
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
        this.difficulty = 5;
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

let camacCoin = new CryptoBlockchain();

if (camacCoin.checkChainValidity()) {
    console.log("Blockchain is valid. Proceeding with operations.");
}
else {
    console.error("Blockchain integrity compromised! Halting operations.");
}


console.log("camacCoin start: " + new Date().toString());

camacCoin.addNewBlock(
    new CryptoBlock(1, "01/06/2024", {
        sender: "Iris Ljesnjanin",
        recipient: "Cosima Mielke",
        quantity: 50
    })
);

camacCoin.addNewBlock(
    new CryptoBlock(2, "01/07/2024", {
        sender: "Vitaly Friedman",
        recipient: "Ricardo Gimenes",
        quantity: 100
    })
);

console.log("camacCoin end: " + new Date().toString());

console.log(JSON.stringify(camacCoin, null, 4));
