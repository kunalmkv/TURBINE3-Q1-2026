/**
 * =============================================================================
 * SPL TOKEN INITIALIZER (Standard Token Program + Metaplex Compatible)
 * =============================================================================
 * 
 * @file spl_init_metaplex.ts
 * @description Creates a standard SPL token using TOKEN_PROGRAM_ID (not Token-2022).
 *              This token is fully compatible with Metaplex Token Metadata.
 * 
 * @process
 *   1. Generate a new mint keypair
 *   2. Create the mint using standard SPL Token Program
 *   3. No transfer fees (use regular SPL token for Metaplex compatibility)
 * 
 * @note
 *   - Uses TOKEN_PROGRAM_ID (standard, not Token-2022)
 *   - No transfer fee extension (for Metaplex compatibility)
 *   - Full Metaplex Token Metadata support
 * 
 * @prerequisites
 *   - Wallet with SOL at ./wallet/dev-wallet.json
 *   - Run: yarn spl_init_metaplex
 * 
 * @output
 *   - Token mint address
 *   - Save this address for spl_metadata.ts
 * 
 * @author Generated for Solana SPL token with Metaplex metadata
 * =============================================================================
 */

import {
    Keypair,
    Connection,
    Commitment,
} from "@solana/web3.js";
import {
    createMint,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import wallet from "./wallet/dev-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://solana-devnet.g.alchemy.com/v2/fhX7Ujdy6kgtBVlUhg3LgFkcu2ucWjP-", commitment);

// Token configuration
const DECIMALS = 9;

(async () => {
    try {
        console.log("=".repeat(60));
        console.log("Creating Standard SPL Token (Metaplex Compatible)");
        console.log("=".repeat(60));
        console.log(`\nWallet: ${keypair.publicKey.toBase58()}`);
        console.log(`Program: TOKEN_PROGRAM_ID (standard SPL token)`);
        console.log(`Decimals: ${DECIMALS}`);

        console.log("\n→ Creating token mint...");

        // Create the mint using standard TOKEN_PROGRAM_ID
        const mint = await createMint(
            connection,
            keypair,               // payer
            keypair.publicKey,     // mintAuthority
            null,                  // freezeAuthority (null = no freeze)
            DECIMALS,              // decimals
            undefined,             // keypair (let it generate one)
            undefined,             // confirmOptions
            TOKEN_PROGRAM_ID       // Standard SPL Token Program (NOT Token-2022)
        );

        console.log("\n" + "=".repeat(60));
        console.log("✓ TOKEN CREATED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log(`\nMint Address: ${mint.toBase58()}`);
        console.log(`\nView token on Explorer:`);
        console.log(`https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
        console.log("\n⚠️  SAVE THIS MINT ADDRESS!");
        console.log(`\nFor spl_mint.ts:`);
        console.log(`const mint = new PublicKey("${mint.toBase58()}");`);
        console.log(`\nFor spl_metadata.ts:`);
        console.log(`const MINT_ADDRESS = "${mint.toBase58()}";`);
        console.log("=".repeat(60));
        console.log("\nNext steps:");
        console.log("  1. Update spl_metadata.ts with this mint address");
        console.log("  2. Run: yarn spl_metadata");
        console.log("  3. Run: yarn spl_mint");
        console.log("=".repeat(60));

    } catch (error) {
        console.log(`Oops, something went wrong: ${error}`);
    }
})();
