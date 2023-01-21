// run the file with `-- timeout 60000` if error of timeout comes
const { expect } = require("chai");
require("dotenv").config();
const web3 = require("@solana/web3.js");
const borsh = require("@project-serum/borsh");

describe("Check Counter Contract", () => {
    let connection;
    let senderKeyPair;

    let progPublicKey = new web3.PublicKey("A1gr4PLeUPTcsEwAuksqhk7FuBzbcRyfbmRBYLwtXJxy");
    let counterDataKeyPair;

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

        // allocate data program id
        let transaction = new web3.Transaction();
        counterDataKeyPair = new web3.Keypair();

        let counterIx = web3.SystemProgram.createAccount({
            fromPubkey: senderKeyPair.publicKey,
            newAccountPubkey: counterDataKeyPair.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(8),
            space: 8,
            programId: progPublicKey
        });

        transaction.add(counterIx);

        await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [senderKeyPair, counterDataKeyPair],
            {
                skipPreflight: true
            }
        )

        console.log(`Counter data address - ${counterDataKeyPair.publicKey.toBase58()}`);
    });

    async function ping_contract() {
        let transaction = new web3.Transaction();

        let instructionBuffer = Buffer.from(new Uint32Array([0]));

        let transactionInst = new web3.TransactionInstruction({
            keys: [
                {
                    pubkey: counterDataKeyPair.publicKey,
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
            [senderKeyPair],
            {
                skipPreflight: true
            }
        )
    }

    it("Counter increases +1", async () => {
        await ping_contract();
    }).timeout(60000);

    async function read_counter_account_data() {
        const dataAccount = await connection.getAccountInfo(counterDataKeyPair.publicKey);

        const borshCounterStruct = borsh.struct([
            borsh.u64("count")
        ]);

        return borshCounterStruct.decode(dataAccount.data)
    }

    it("Reading contract - value 1", async () => {
        const { count } = await read_counter_account_data();
        expect(count.toString()).to.equal("1");
    }).timeout(60000);

    it("Counter increases +3", async () => {
        await ping_contract();
        await ping_contract();
        await ping_contract();
    }).timeout(180000);

    it("Reading contract - value 4", async () => {
        const { count } = await read_counter_account_data();
        expect(count.toString()).to.equal("4");
    }).timeout(60000);
})