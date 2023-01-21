const { expect } = require("chai");
require("dotenv").config();
const web3 = require("@solana/web3.js");
const borsh = require("@project-serum/borsh");

describe("Check Counter Contract", () => {
    let connection;
    let senderKeyPair;

    let progPublicKey = new web3.PublicKey("A1gr4PLeUPTcsEwAuksqhk7FuBzbcRyfbmRBYLwtXJxy");
    let counterDataKey = ""

    before(async () => {
        if (progPublicKey == null) {
            throw Error("First deploy the program using - solana program deploy <path-to-.so-file>");
        }

        // setup connection
        connection = new web3.Connection("http://localhost:8899");

        // setup senderKeyPair
        const privateSeedKey = JSON.parse(process.env.PRIVATE_SEED_KEY);
        senderKeyPair = web3.Keypair.fromSecretKey(
            Uint8Array.from(privateSeedKey)
        );
    })

    it("Counter increases", async () => {
        // allocate data program id
        let transaction = new web3.Transaction();

        let counterKeyPair = new web3.Keypair();
        console.log(counterKeyPair.publicKey.toBase58());

        let counterIx = web3.SystemProgram.createAccount({
            fromPubkey: senderKeyPair.publicKey,
            newAccountPubkey: counterKeyPair.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(8),
            space: 8,
            programId: progPublicKey
        });

        transaction.add(counterIx);

        let instructionBuffer = Buffer.from(new Uint32Array([0]));

        let transactionInst = new web3.TransactionInstruction({
            keys: [
                {
                    pubkey: counterKeyPair.publicKey,
                    // pubkey: new web3.PublicKey("95qTB38tF1kfupaKXx3uqwMxtkZXMPh91etWq47yZzVL"),
                    isSigner: false,
                    isWritable: true
                }
            ],
            programId: progPublicKey,
            data: instructionBuffer
        });

        transaction.add(transactionInst);

        await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [senderKeyPair, counterKeyPair],
            {
                skipPreflight: true
            }
        )

    }).timeout(60000);
})