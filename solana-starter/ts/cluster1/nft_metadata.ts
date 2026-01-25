/**
 * =============================================================================
 * NFT METADATA UPLOADER
 * =============================================================================
 * 
 * @file nft_metadata.ts
 * @description Creates and uploads NFT metadata JSON to Arweave via Irys.
 *              This is Step 2 of the NFT minting process.
 * 
 * @process
 *   1. Define metadata following Metaplex Token Metadata Standard
 *   2. Include the image URI from Step 1 (nft_image.ts)
 *   3. Upload metadata JSON to Arweave
 *   4. Return a permanent metadata URI for minting
 * 
 * @metadata_structure
 *   {
 *     name: "NFT Name",
 *     symbol: "SYMBOL",
 *     description: "Description",
 *     image: "arweave_image_uri",
 *     attributes: [...],
 *     properties: { files: [...], category: "image" },
 *     creators: [...]
 *   }
 * 
 * @prerequisites
 *   - Complete Step 1 (nft_image.ts) first
 *   - Update IMAGE_URI below with the URI from Step 1
 *   - Run: yarn nft_metadata
 * 
 * @output
 *   - Arweave URI for the metadata JSON
 *   - Save this URI for use in nft_mint.ts
 * 
 * @reference
 *   https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
 * 
 * @author Generated for Solana NFT minting
 * =============================================================================
 */

import wallet from "./wallet/dev-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

// =============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// =============================================================================

/**
 * Image URI from Step 1 (nft_image.ts)
 * Replace this with your actual image URI from Arweave
 */
const IMAGE_URI = "https://gateway.irys.xyz/5SrwJfQbqZQvzKQQYK1ticwqirYV3DmSiD73ecuVedgY";

/**
 * NFT Metadata Configuration
 * Customize these values for your NFT
 */
const NFT_CONFIG = {
    name: "Generug #1",
    symbol: "GRUG",
    description: "A unique generative pixel art rug featuring geometric patterns in autumn colors. Hand-crafted digital art with intricate grid design and traditional fringe details.",
};

/**
 * NFT Attributes (Traits)
 * These appear as properties on marketplaces like Magic Eden
 */
const ATTRIBUTES = [
    { trait_type: "Background", value: "Cream" },
    { trait_type: "Primary Color", value: "Gold" },
    { trait_type: "Pattern", value: "Geometric Grid" },
    { trait_type: "Style", value: "Pixel Art" },
    { trait_type: "Colors", value: "Autumn Palette" },
    { trait_type: "Edition", value: "1 of 1" },
];

// =============================================================================
// UMI SETUP
// =============================================================================

// Create a devnet connection using Metaplex UMI
const umi = createUmi("https://api.devnet.solana.com");

// Create keypair from wallet file
let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

// Configure UMI with Irys uploader and signer identity
umi.use(irysUploader({
    address: "https://devnet.irys.xyz",
}));
umi.use(signerIdentity(signer));

// =============================================================================
// MAIN EXECUTION
// =============================================================================

(async () => {
    try {
        console.log("=".repeat(60));
        console.log("NFT METADATA UPLOADER - Step 2 of 3");
        console.log("=".repeat(60));
        console.log(`\nWallet: ${signer.publicKey}`);

        // Validate image URI
        if (IMAGE_URI.includes("<PASTE") || IMAGE_URI.length < 10) {
            console.error("\n❌ ERROR: Please update IMAGE_URI with the URI from Step 1");
            console.log("   Run 'yarn nft_image' first, then paste the URI here.");
            process.exit(1);
        }

        console.log(`Image URI: ${IMAGE_URI}`);

        // Step 1: Build metadata object following Metaplex standard
        console.log("\n→ Building metadata JSON...");
        
        /**
         * Metadata structure follows Metaplex Token Metadata Standard
         * @see https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
         */
        const metadata = {
            name: NFT_CONFIG.name,
            symbol: NFT_CONFIG.symbol,
            description: NFT_CONFIG.description,
            image: IMAGE_URI,
            attributes: ATTRIBUTES,
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: IMAGE_URI,
                    },
                ],
                category: "image",
            },
            creators: [
                {
                    address: signer.publicKey.toString(),
                    share: 100, // 100% share to the creator
                },
            ],
        };

        console.log("\nMetadata Preview:");
        console.log("-".repeat(40));
        console.log(`  Name: ${metadata.name}`);
        console.log(`  Symbol: ${metadata.symbol}`);
        console.log(`  Description: ${metadata.description.substring(0, 50)}...`);
        console.log(`  Attributes: ${metadata.attributes.length} traits`);
        console.log(`  Creator: ${metadata.creators[0].address}`);

        // Step 2: Upload metadata to Arweave
        console.log("\n→ Uploading metadata to Arweave via Irys...");
        console.log("  (This may take a moment and costs a small amount of SOL)");

        const metadataUri = await umi.uploader.uploadJson(metadata);

        // Success!
        console.log("\n" + "=".repeat(60));
        console.log("✓ METADATA UPLOADED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log(`\nMetadata URI: ${metadataUri}`);
        console.log("\n⚠️  SAVE THIS URI! You'll need it for nft_mint.ts");
        console.log("\nNext step: Update nft_mint.ts with this URI and run:");
        console.log("  yarn nft_mint");
        console.log("=".repeat(60));

    } catch (error) {
        console.error("\n❌ Error uploading metadata:", error);
        console.log("\nTroubleshooting:");
        console.log("  1. Make sure your wallet has enough SOL");
        console.log("  2. Verify the IMAGE_URI is correct");
        console.log("  3. Check your internet connection");
    }
})();
