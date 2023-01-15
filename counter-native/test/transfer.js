// run using -   npx mocha --timeout 60000 ./transfer.js

const { expect } = require("chai");
require("dotenv").config();
const web3 = require("@solana/web3.js");

describe("Check Transfering SOL", () => {
    let connection;
    let senderKeyPair;
    let recipientKey = new web3.PublicKey("FULYk2zow2XSVX1hJM3wF4A1xZZFWFpqfm6Ewj3SdiWq");

    before(async () => {
        // setup connection
        connection = new web3.Connection("http://localhost:8899");

        // setup key
        const privateSeedKey = JSON.parse(process.env.PRIVATE_SEED_KEY);
        senderKeyPair = web3.Keypair.fromSecretKey(
            Uint8Array.from(privateSeedKey)
        );
    })

    it("Transfer SOL", async () => {
        // initial balances
        let initialSenderBalance = await connection.getBalance(senderKeyPair.publicKey);
        let initialRecipientBalance = await connection.getBalance(recipientKey);

        // transfer
        let transaction = new web3.Transaction();

        const transferAmount = 2 * web3.LAMPORTS_PER_SOL;
        const sendSOLInstruction = web3.SystemProgram.transfer({
            fromPubkey: senderKeyPair.publicKey,
            toPubkey: recipientKey,
            lamports: transferAmount
        });

        transaction.add(sendSOLInstruction);

        await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [senderKeyPair]
        );

        // after transfer balances
        let newSenderBalance = await connection.getBalance(senderKeyPair.publicKey);
        let newRecipientBalance = await connection.getBalance(recipientKey);

        console.log(`Address - ${senderKeyPair.publicKey} : Initial Balance - ${initialSenderBalance}, New Balance - ${newSenderBalance} `);
        console.log(`Address - ${recipientKey} : Initial Balance - ${initialRecipientBalance}, New Balance - ${newRecipientBalance} `);

        expect(newRecipientBalance).to.equal(initialRecipientBalance + transferAmount);
        expect(newSenderBalance).to.lessThan(initialSenderBalance - transferAmount); // gas fee also paid
    });
})