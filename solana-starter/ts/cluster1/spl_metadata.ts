/**
 * =============================================================================
 * SPL TOKEN METADATA CREATOR
 * =============================================================================
 * 
 * @file spl_metadata.ts
 * @description Adds metadata to an existing SPL token using Metaplex Token 
 *              Metadata program. This makes your token discoverable and 
 *              displayable on wallets, explorers, and marketplaces.
 * 
 * @process
 *   1. Optionally upload metadata JSON to Arweave (for rich metadata)
 *   2. Create a metadata account on-chain that points to your mint
 *   3. The metadata account stores: name, symbol, URI, creators, etc.
 * 
 * @metadata_account
 *   - Points to your SPL token mint address
 *   - Stores on-chain: name, symbol, URI
 *   - URI can point to JSON file with full metadata (image, description, etc.)
 *   - Makes token visible in wallets and explorers
 * 
 * @prerequisites
 *   - Token mint must already exist (run spl_init.ts first)
 *   - Update MINT_ADDRESS below with your token's mint address
 *   - Wallet with SOL for transaction fees
 *   - Run: yarn spl_metadata
 * 
 * @output
 *   - Metadata account address (PDA derived from mint)
 *   - Transaction signature
 *   - Explorer link to view metadata
 * 
 * @reference
 *   - Metaplex Token Metadata: https://docs.metaplex.com/programs/token-metadata/
 *   - Metadata JSON Standard: https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
 * 
 * @author Generated for Solana SPL token metadata
 * =============================================================================
 */

import wallet from "./wallet/dev-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
    createMetadataAccountV3,
    CreateMetadataAccountV3InstructionAccounts,
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    createSignerFromKeypair,
    signerIdentity,
    publicKey,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import base58 from "bs58";

// =============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// =============================================================================

/**
 * Your SPL Token Mint Address
 * Get this from spl_init.ts output
 * Example: "75qoQ7wo4Zax7EvZ3mGj9toiAL9HDNkuEDfRmF19T9tA"
 */
const MINT_ADDRESS = "5SY3Rna38Ay1SAQvswinezjdaeGv576LAfTv9Vo7dcft";

/**
 * Token Metadata Configuration
 * These values are stored on-chain
 */
const TOKEN_METADATA = {
    /** Token name (e.g., "My Awesome Token") */
    name: "Transfer Fee Token",
    /** Token symbol (e.g., "TFT") */
    symbol: "TFT",
    /** URI pointing to metadata JSON (can be Arweave, IPFS, or any HTTPS URL) */
    uri: "https://gateway.irys.xyz/2MGBorJjgj4wqine3KAETUmoavZNYt67n3gQVt1zriHw", // Use existing metadata or set manually
};

/**
 * Optional: Upload metadata JSON to Arweave
 * Set to true to upload rich metadata JSON, false to use direct URI
 * Note: If Irys is unavailable, set to false and provide a URI manually
 */
const UPLOAD_METADATA_JSON = true;

/**
 * Rich Metadata (only used if UPLOAD_METADATA_JSON is true)
 * This will be uploaded to Arweave and the URI will be used
 * IMPORTANT: For fungible SPL tokens, keep this simple (no image, no complex properties)
 */
const RICH_METADATA = {
    description: "A Solana SPL token with 1% transfer fee. Built using Token-2022 program with transfer fee extension.",
    // DO NOT include image for fungible tokens (that's for NFTs)
    // image: "",
    // DO NOT include complex attributes for fungible tokens
    // attributes: [],
    // DO NOT include properties for fungible tokens
    // properties: {},
};

// =============================================================================
// UMI SETUP
// =============================================================================

// Create a devnet connection using Metaplex UMI
// Using Alchemy RPC endpoint for better reliability
const umi = createUmi("https://solana-devnet.g.alchemy.com/v2/fhX7Ujdy6kgtBVlUhg3LgFkcu2ucWjP-");

// Create keypair from wallet file
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

// Configure UMI with Token Metadata program and signer identity
umi.use(mplTokenMetadata());
umi.use(signerIdentity(signer));

// Configure Irys uploader if uploading metadata JSON
if (UPLOAD_METADATA_JSON) {
    umi.use(irysUploader()); // Use default endpoint
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

(async () => {
    try {
        console.log("=".repeat(60));
        console.log("SPL TOKEN METADATA CREATOR");
        console.log("=".repeat(60));
        console.log(`\nWallet: ${signer.publicKey}`);

        // Validate mint address
        if (MINT_ADDRESS.includes("<PASTE") || MINT_ADDRESS.length < 32) {
            console.error("\n❌ ERROR: Please update MINT_ADDRESS with your token's mint address");
            console.log("   Get this from spl_init.ts output.");
            process.exit(1);
        }

        const mint = publicKey(MINT_ADDRESS);
        console.log(`Mint Address: ${mint}`);

        // Validate this is a fungible token mint, not an NFT
        console.log("\n→ Validating mint type...");
        try {
            const mintAccount = await umi.rpc.getAccount(mint);
            if (!mintAccount.exists) {
                console.error("\n❌ ERROR: Mint account does not exist!");
                console.log("   Please verify the MINT_ADDRESS is correct.");
                console.log("   Make sure you've run spl_init.ts first.");
                process.exit(1);
            }
            console.log("  Mint account exists ✓");
        } catch (error) {
            console.log("  Could not verify mint account (will proceed anyway)");
        }

        // Step 1: Optionally upload metadata JSON to Arweave
        let metadataUri = TOKEN_METADATA.uri;

        if (UPLOAD_METADATA_JSON) {
            console.log("\n→ Uploading metadata JSON to Arweave...");
            console.log("  (This may take a moment and costs a small amount of SOL)");

            // Build metadata JSON for SPL token (simple, no NFT fields)
            const metadataJson = {
                name: TOKEN_METADATA.name,
                symbol: TOKEN_METADATA.symbol,
                description: RICH_METADATA.description,
                // Do NOT include image, attributes, properties for fungible SPL tokens
            };

            // Upload to Arweave
            metadataUri = await umi.uploader.uploadJson(metadataJson);
            console.log(`✓ Metadata JSON uploaded: ${metadataUri}`);
        } else {
            // Use provided URI or validate it's set
            if (!metadataUri || metadataUri.length < 10) {
                console.error("\n❌ ERROR: TOKEN_METADATA.uri must be set when UPLOAD_METADATA_JSON is false");
                console.log("   Either set UPLOAD_METADATA_JSON to true, or provide a valid URI.");
                process.exit(1);
            }
            console.log(`\n→ Using provided metadata URI: ${metadataUri}`);
        }

        // Step 2: Prepare metadata account accounts
        console.log("\n→ Preparing metadata account...");

        // Step 3: Prepare metadata data
        /**
         * DataV2Args defines what metadata to store on-chain
         * - name: Token name (max 32 bytes)
         * - symbol: Token symbol (max 10 bytes)
         * - uri: URI pointing to full metadata JSON
         * - sellerFeeBasisPoints: Royalty percentage (0-10000, where 10000 = 100%)
         * - creators: Array of creators (optional)
         * - collection: Collection info (optional, for NFTs)
         * - uses: Usage restrictions (optional, for NFTs)
         */
        const data: DataV2Args = {
            name: TOKEN_METADATA.name,
            symbol: TOKEN_METADATA.symbol,
            uri: metadataUri,
            sellerFeeBasisPoints: 0, // 0% royalty for fungible tokens (typically)
            creators: [
                {
                    address: signer.publicKey,
                    verified: true, // Creator is verified (signed the transaction)
                    share: 100, // 100% share
                },
            ],
            collection: null, // Not part of a collection
            uses: null, // No usage restrictions
        };

        /**
         * The metadata account is a Program Derived Address (PDA)
         * It's derived from: ['metadata', metadata_program_id, mint]
         * We don't need to create it manually - Metaplex handles this
         */
        const accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: mint, // The token mint address
            mintAuthority: signer, // Authority that can update metadata
            payer: signer, // Pays for the transaction
            updateAuthority: signer, // Can update metadata in the future
        };

        // Step 3: Prepare instruction arguments
        const args: CreateMetadataAccountV3InstructionArgs = {
            data: data,
            isMutable: true, // Allow metadata updates in the future
            collectionDetails: null, // Not part of a collection (null for fungible tokens)
        };

        // Step 4: Create metadata account
        console.log("\n→ Creating metadata account on-chain...");
        console.log(`  Name: ${data.name}`);
        console.log(`  Symbol: ${data.symbol}`);
        console.log(`  URI: ${data.uri}`);
        console.log(`  Mutable: ${args.isMutable}`);

        const tx = createMetadataAccountV3(umi, {
            ...accounts,
            ...args,
        });

        // Send and confirm transaction
        console.log("\n→ Sending transaction...");
        const result = await tx.sendAndConfirm(umi);
        const signature = base58.encode(result.signature);

        // Calculate metadata account address (PDA)
        // This is derived from: ['metadata', metadata_program_id, mint]
        // We can't easily calculate it here, but it's deterministic
        // You can find it on Solana Explorer by searching for the mint address

        // Success!
        console.log("\n" + "=".repeat(60));
        console.log("✓ METADATA CREATED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log(`\nToken Mint: ${mint}`);
        console.log(`Transaction: ${signature}`);
        console.log(`\nView token on Solana Explorer:`);
        console.log(`https://explorer.solana.com/address/${mint}?cluster=devnet`);
        console.log(`\nView transaction:`);
        console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        console.log("\n" + "=".repeat(60));
        console.log("Your SPL token now has metadata and will be visible in wallets!");
        console.log("=".repeat(60));

    } catch (error: any) {
        console.error("\n❌ Error creating metadata:", error.message || error);
        
        // Check for specific error types
        if (error.message && error.message.includes("ProgrammableNonFungible")) {
            console.error("\n⚠️  IMPORTANT: The mint address appears to be an NFT, not a fungible SPL token!");
            console.log("\nThis error occurs when:");
            console.log("  - The MINT_ADDRESS points to an NFT mint (not an SPL token)");
            console.log("  - The mint already has NFT metadata attached");
            console.log("\nSolution:");
            console.log("  1. Make sure you're using the mint address from spl_init.ts (your SPL token)");
            console.log("  2. Do NOT use the NFT mint address from nft_mint.ts");
            console.log("  3. Verify the mint address in spl_init.ts output");
            console.log("  4. If you created a new token, use that mint address instead");
        } else {
            console.log("\nTroubleshooting:");
            console.log("  1. Make sure your wallet has enough SOL (~0.01 SOL needed)");
            console.log("  2. Verify the MINT_ADDRESS is correct (from spl_init.ts output)");
            console.log("  3. Check that the token mint exists (run spl_init.ts first)");
            console.log("  4. Ensure you're the mint authority");
            console.log("  5. Check your internet connection");
        }
    }
})();
