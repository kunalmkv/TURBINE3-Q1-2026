/**
 * =============================================================================
 * NFT MINTER
 * =============================================================================
 * 
 * @file nft_mint.ts
 * @description Mints an NFT on Solana using Metaplex Token Metadata program.
 *              This is Step 3 (final step) of the NFT minting process.
 * 
 * @process
 *   1. Generate a new mint keypair for the NFT
 *   2. Create the NFT using Metaplex's createNft instruction
 *   3. This creates three accounts on-chain:
 *      - Mint Account: The NFT's unique address
 *      - Token Account: Holds the NFT (owned by your wallet)
 *      - Metadata Account: Points to the metadata URI
 * 
 * @nft_properties
 *   - Supply: 1 (non-fungible)
 *   - Decimals: 0
 *   - Seller Fee: 5% (500 basis points) - royalty on secondary sales
 *   - Primary Sale: true (first sale)
 * 
 * @prerequisites
 *   - Complete Step 1 (nft_image.ts) - upload image
 *   - Complete Step 2 (nft_metadata.ts) - upload metadata
 *   - Update METADATA_URI below with the URI from Step 2
 *   - Run: yarn nft_mint
 * 
 * @output
 *   - NFT Mint Address (unique identifier)
 *   - Transaction signature
 *   - Explorer link to view your NFT
 * 
 * @author Generated for Solana NFT minting
 * =============================================================================
 */

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { 
    createSignerFromKeypair, 
    signerIdentity, 
    generateSigner, 
    percentAmount 
} from "@metaplex-foundation/umi";
import { 
    createNft, 
    mplTokenMetadata 
} from "@metaplex-foundation/mpl-token-metadata";
import wallet from "./wallet/dev-wallet.json";
import base58 from "bs58";

// =============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// =============================================================================

/**
 * Metadata URI from Step 2 (nft_metadata.ts)
 * Replace this with your actual metadata URI from Arweave
 */
const METADATA_URI = "https://gateway.irys.xyz/2MGBorJjgj4wqine3KAETUmoavZNYt67n3gQVt1zriHw";

/**
 * NFT Configuration
 * These values are stored on-chain
 */
const NFT_CONFIG = {
    name: "Generug #1",
    symbol: "GRUG",
    /** Seller fee basis points (500 = 5% royalty on secondary sales) */
    sellerFeeBasisPoints: 500,
};

// =============================================================================
// UMI SETUP
// =============================================================================

// RPC endpoint for devnet
const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Create UMI instance with devnet connection
const umi = createUmi(RPC_ENDPOINT);

// Create keypair from wallet file
let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);

// Configure UMI with signer and Token Metadata program
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

// =============================================================================
// MAIN EXECUTION
// =============================================================================

(async () => {
    try {
        console.log("=".repeat(60));
        console.log("NFT MINTER - Step 3 of 3 (Final)");
        console.log("=".repeat(60));
        console.log(`\nWallet: ${myKeypairSigner.publicKey}`);

        // Validate metadata URI
        if (METADATA_URI.includes("<PASTE") || METADATA_URI.length < 10) {
            console.error("\n❌ ERROR: Please update METADATA_URI with the URI from Step 2");
            console.log("   Run 'yarn nft_metadata' first, then paste the URI here.");
            process.exit(1);
        }

        console.log(`Metadata URI: ${METADATA_URI}`);

        // Step 1: Generate a new mint keypair
        // This will be the unique address of your NFT
        console.log("\n→ Generating mint keypair...");
        const mint = generateSigner(umi);
        console.log(`  Mint Address: ${mint.publicKey}`);

        // Step 2: Create the NFT
        console.log("\n→ Creating NFT on-chain...");
        console.log("  (This will create Mint, Token, and Metadata accounts)");
        console.log(`  Name: ${NFT_CONFIG.name}`);
        console.log(`  Symbol: ${NFT_CONFIG.symbol}`);
        console.log(`  Royalty: ${NFT_CONFIG.sellerFeeBasisPoints / 100}%`);

        /**
         * createNft creates a new NFT with:
         * - Mint account (the NFT address)
         * - Associated Token Account (holds the NFT)
         * - Metadata account (stores name, symbol, URI)
         * - Master Edition account (proves it's an NFT)
         */
        let tx = createNft(umi, {
            mint: mint,
            name: NFT_CONFIG.name,
            symbol: NFT_CONFIG.symbol,
            uri: METADATA_URI,
            sellerFeeBasisPoints: percentAmount(NFT_CONFIG.sellerFeeBasisPoints / 100),
            creators: [
                {
                    address: myKeypairSigner.publicKey,
                    verified: true,
                    share: 100, // 100% of royalties go to this creator
                },
            ],
            isMutable: true, // Allow metadata updates
            primarySaleHappened: false, // First sale hasn't happened yet
        });

        // Send and confirm transaction
        console.log("\n→ Sending transaction...");
        let result = await tx.sendAndConfirm(umi);
        
        // Encode signature for explorer link
        const signature = base58.encode(result.signature);

        // Success!
        console.log("\n" + "=".repeat(60));
        console.log("🎉 NFT MINTED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log(`\nNFT Mint Address: ${mint.publicKey}`);
        console.log(`Transaction: ${signature}`);
        console.log(`\nView your NFT on Solana Explorer:`);
        console.log(`https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`);
        console.log(`\nView transaction:`);
        console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        console.log("\n" + "=".repeat(60));
        console.log("Congratulations! Your NFT is now live on Solana devnet! 🚀");
        console.log("=".repeat(60));

    } catch (error) {
        console.error("\n❌ Error minting NFT:", error);
        console.log("\nTroubleshooting:");
        console.log("  1. Make sure your wallet has enough SOL (~0.01 SOL needed)");
        console.log("  2. Verify the METADATA_URI is correct");
        console.log("  3. Check your internet connection");
        console.log("  4. Ensure Steps 1 and 2 completed successfully");
    }
})();
