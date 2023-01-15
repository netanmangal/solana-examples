const { expect } = require("chai");
require("dotenv").config();
const web3 = require("@solana/web3.js");
const bip39 = require("bip39");

describe("Check balance and Account info", () => {
    let connection;
    let senderKeyPair;

    before(async () => {
        // setup connection
        connection = new web3.Connection("http://localhost:8899");

        // setup key
        const privateSeedKey = JSON.parse(process.env.PRIVATE_SEED_KEY);
        senderKeyPair = web3.Keypair.fromSecretKey(
            Uint8Array.from(privateSeedKey)
        );
    })

    it("Check balance", async () => {
        let balance = await connection.getBalance(senderKeyPair.publicKey);
        console.log(`Balance of ${senderKeyPair.publicKey.toBase58()} is ${balance / web3.LAMPORTS_PER_SOL}`);
        expect(balance).to.greaterThan(10);
    })

    it("Get Account info", async () => {
        let account_info = await connection.getAccountInfo(senderKeyPair.publicKey);
        console.log(account_info);

        expect(account_info.rentEpoch).to.equal(0);
        expect(account_info.executable).to.equal(false);
    })
})