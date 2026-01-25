import {
    Keypair,
    Connection,
    Commitment,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    createInitializeTransferFeeConfigInstruction,
    getMintLen,
} from "@solana/spl-token";
import wallet from "./wallet/dev-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// ============================================================
// TRANSFER FEE CONFIGURATION
// ============================================================
const TRANSFER_FEE_BASIS_POINTS = 100; // 1% fee (100 basis points = 1%)
const MAX_FEE = BigInt(1_000_000_000); // Maximum fee per transfer (in smallest units)
const DECIMALS = 9;

(async () => {
    try {
        // Generate a new mint keypair
        const mintKeypair = Keypair.generate();
        const mint = mintKeypair.publicKey;

        console.log(`Creating SPL Token with Transfer Fee (Token-2022)...`);
        console.log(`Mint Address: ${mint.toBase58()}`);
        console.log(`Transfer Fee: ${TRANSFER_FEE_BASIS_POINTS / 100}% (${TRANSFER_FEE_BASIS_POINTS} basis points)`);
        console.log(`Max Fee: ${MAX_FEE.toString()} smallest units`);

        // Calculate space needed for mint with transfer fee extension
        const extensions = [ExtensionType.TransferFeeConfig];
        const mintLen = getMintLen(extensions);
        const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);

        // Build transaction to create mint with transfer fee
        const transaction = new Transaction().add(
            // 1. Create account for the mint
            SystemProgram.createAccount({
                fromPubkey: keypair.publicKey,
                newAccountPubkey: mint,
                space: mintLen,
                lamports: mintLamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            // 2. Initialize transfer fee config (MUST be before mint initialization)
            createInitializeTransferFeeConfigInstruction(
                mint,
                keypair.publicKey, // transferFeeConfigAuthority
                keypair.publicKey, // withdrawWithheldAuthority
                TRANSFER_FEE_BASIS_POINTS,
                MAX_FEE,
                TOKEN_2022_PROGRAM_ID
            ),
            // 3. Initialize the mint
            createInitializeMintInstruction(
                mint,
                DECIMALS,
                keypair.publicKey, // mintAuthority
                null, // freezeAuthority (null = no freeze)
                TOKEN_2022_PROGRAM_ID
            )
        );

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair, mintKeypair]
        );

        console.log(`\nSuccess! Token mint created.`);
        console.log(`Mint Address: ${mint.toBase58()}`);
        console.log(`TX: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        console.log(`\nView token on Explorer:`);
        console.log(`https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
        console.log(`\n⚠️  SAVE THIS MINT ADDRESS for spl_mint.ts and spl_transfer.ts:`);
        console.log(`const mint = new PublicKey("${mint.toBase58()}");`);
    } catch (error) {
        console.log(`Oops, something went wrong: ${error}`);
    }
})();
