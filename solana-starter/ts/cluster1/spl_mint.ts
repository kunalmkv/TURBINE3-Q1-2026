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
    mintTo,
} from "@solana/spl-token";
import wallet from "./wallet/dev-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// ============================================================
// CONFIGURATION - UPDATE THIS WITH YOUR MINT ADDRESS FROM spl_init
// ============================================================
const mint = new PublicKey("75qoQ7wo4Zax7EvZ3mGj9toiAL9HDNkuEDfRmF19T9tA");
const DECIMALS = 9;
const AMOUNT_TO_MINT = 1_000_000_000; // 1 billion tokens

(async () => {
    try {
        console.log(`Minting SPL tokens (Token-2022)...`);
        console.log(`Mint: ${mint.toBase58()}`);
        console.log(`Amount: ${AMOUNT_TO_MINT.toLocaleString()} tokens`);

        // Get the associated token account address
        const ata = getAssociatedTokenAddressSync(
            mint,
            keypair.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        console.log(`Associated Token Account: ${ata.toBase58()}`);

        // Check if ATA exists, if not create it
        const ataInfo = await connection.getAccountInfo(ata);
        if (!ataInfo) {
            console.log(`Creating Associated Token Account...`);
            const createAtaTx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    keypair.publicKey,
                    ata,
                    keypair.publicKey,
                    mint,
                    TOKEN_2022_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            );
            await sendAndConfirmTransaction(connection, createAtaTx, [keypair]);
            console.log(`ATA created: ${ata.toBase58()}`);
        } else {
            console.log(`ATA already exists.`);
        }

        // Mint tokens
        const tokensToMint = BigInt(AMOUNT_TO_MINT) * BigInt(10 ** DECIMALS);
        
        const mintTx = await mintTo(
            connection,
            keypair,
            mint,
            ata,
            keypair, // mint authority
            tokensToMint,
            [],
            undefined,
            TOKEN_2022_PROGRAM_ID
        );

        console.log(`\nSuccess! Tokens minted.`);
        console.log(`Amount: ${AMOUNT_TO_MINT.toLocaleString()} tokens`);
        console.log(`TX: https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);
        console.log(`\nView token account:`);
        console.log(`https://explorer.solana.com/address/${ata.toBase58()}?cluster=devnet`);
    } catch (error) {
        console.log(`Oops, something went wrong: ${error}`);
    }
})();
