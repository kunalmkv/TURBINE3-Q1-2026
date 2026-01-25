import {
    Keypair,
    PublicKey,
    Connection,
    Commitment,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    transferCheckedWithFee,
    getAccount,
    getTransferFeeAmount,
} from "@solana/spl-token";
import wallet from "./wallet/dev-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// ============================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================
const mint = new PublicKey("75qoQ7wo4Zax7EvZ3mGj9toiAL9HDNkuEDfRmF19T9tA");
// Test recipient - generating a random address for demo
const to = Keypair.generate().publicKey; // random test recipient

const DECIMALS = 9;
const TRANSFER_FEE_BASIS_POINTS = 100; // 1% fee
const MAX_FEE = BigInt(1_000_000_000);
const TRANSFER_AMOUNT = 100; // tokens to transfer

(async () => {
    try {
        console.log(`Transferring SPL tokens with fee (Token-2022)...`);
        console.log(`Mint: ${mint.toBase58()}`);
        console.log(`From: ${keypair.publicKey.toBase58()}`);
        console.log(`To: ${to.toBase58()}`);
        console.log(`Amount: ${TRANSFER_AMOUNT} tokens`);
        console.log(`Fee: ${TRANSFER_FEE_BASIS_POINTS / 100}%`);

        // Get the token account of the fromWallet
        const fromAta = getAssociatedTokenAddressSync(
            mint,
            keypair.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        console.log(`From ATA: ${fromAta.toBase58()}`);

        // Get the token account of the toWallet, create if doesn't exist
        const toAta = getAssociatedTokenAddressSync(
            mint,
            to,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        console.log(`To ATA: ${toAta.toBase58()}`);

        // Check if recipient ATA exists, if not create it
        const toAtaInfo = await connection.getAccountInfo(toAta);
        if (!toAtaInfo) {
            console.log(`Creating recipient's Associated Token Account...`);
            const createAtaTx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    keypair.publicKey,
                    toAta,
                    to,
                    mint,
                    TOKEN_2022_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            );
            await sendAndConfirmTransaction(connection, createAtaTx, [keypair]);
            console.log(`Recipient ATA created.`);
        }

        // Calculate transfer amount and fee
        const transferAmount = BigInt(TRANSFER_AMOUNT) * BigInt(10 ** DECIMALS);
        const calculatedFee = (transferAmount * BigInt(TRANSFER_FEE_BASIS_POINTS)) / BigInt(10000);
        const fee = calculatedFee > MAX_FEE ? MAX_FEE : calculatedFee;

        console.log(`\nTransfer amount: ${TRANSFER_AMOUNT} tokens`);
        console.log(`Fee amount: ${Number(fee) / 10 ** DECIMALS} tokens`);
        console.log(`Recipient receives: ${TRANSFER_AMOUNT - Number(fee) / 10 ** DECIMALS} tokens`);

        // Transfer with fee using transferCheckedWithFee (required for Token-2022 with transfer fees)
        const transferSig = await transferCheckedWithFee(
            connection,
            keypair,
            fromAta,
            mint,
            toAta,
            keypair.publicKey,
            transferAmount,
            DECIMALS,
            fee,
            [],
            undefined,
            TOKEN_2022_PROGRAM_ID
        );

        console.log(`\nSuccess! Transfer complete.`);
        console.log(`TX: https://explorer.solana.com/tx/${transferSig}?cluster=devnet`);

        // Check recipient balance and withheld fees
        const recipientAccount = await getAccount(
            connection,
            toAta,
            undefined,
            TOKEN_2022_PROGRAM_ID
        );
        const withheldAmount = getTransferFeeAmount(recipientAccount);

        console.log(`\nRecipient balance: ${Number(recipientAccount.amount) / 10 ** DECIMALS} tokens`);
        console.log(`Withheld fee: ${withheldAmount ? Number(withheldAmount.withheldAmount) / 10 ** DECIMALS : 0} tokens`);
    } catch (error) {
        console.log(`Oops, something went wrong: ${error}`);
    }
})();
