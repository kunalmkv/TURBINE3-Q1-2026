/**
 * =============================================================================
 * NFT IMAGE UPLOADER
 * =============================================================================
 * 
 * @file nft_image.ts
 * @description Uploads an image file to Arweave via Irys (formerly Bundlr).
 *              This is Step 1 of the NFT minting process.
 * 
 * @process
 *   1. Load the image file from disk (generug.png)
 *   2. Convert to a GenericFile format that Metaplex UMI understands
 *   3. Upload to Arweave using Irys uploader
 *   4. Return a permanent, immutable URI (https://arweave.net/...)
 * 
 * @prerequisites
 *   - Wallet with SOL at ./wallet/dev-wallet.json
 *   - Image file at ../generug.png
 *   - Run: yarn nft_image
 * 
 * @output
 *   - Arweave URI for the uploaded image
 *   - Save this URI for use in nft_metadata.ts
 * 
 * @dependencies
 *   - @metaplex-foundation/umi-bundle-defaults
 *   - @metaplex-foundation/umi
 *   - @metaplex-foundation/umi-uploader-irys
 * 
 * @author Generated for Solana NFT minting
 * =============================================================================
 */

import wallet from "./wallet/dev-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";
import * as path from "path";

// =============================================================================
// CONFIGURATION
// =============================================================================

/** Path to the image file to upload */
const IMAGE_PATH = path.join(__dirname, "..", "generug.png");

/** Image MIME type */
const IMAGE_TYPE = "image/png";

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
    address: "https://devnet.irys.xyz", // Devnet Irys endpoint
}));
umi.use(signerIdentity(signer));

// =============================================================================
// MAIN EXECUTION
// =============================================================================

(async () => {
    try {
        console.log("=".repeat(60));
        console.log("NFT IMAGE UPLOADER - Step 1 of 3");
        console.log("=".repeat(60));
        console.log(`\nWallet: ${signer.publicKey}`);
        console.log(`Image: ${IMAGE_PATH}`);

        // Step 1: Load image from disk
        console.log("\n→ Loading image file...");
        const imageBuffer = await readFile(IMAGE_PATH);
        console.log(`  Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

        // Step 2: Convert to GenericFile format
        // GenericFile is Metaplex UMI's standard format for file uploads
        console.log("→ Converting to GenericFile format...");
        const genericFile = createGenericFile(
            imageBuffer,
            "generug.png",
            { contentType: IMAGE_TYPE }
        );

        // Step 3: Upload to Arweave via Irys
        console.log("→ Uploading to Arweave via Irys...");
        console.log("  (This may take a moment and costs a small amount of SOL)");
        
        const [imageUri] = await umi.uploader.upload([genericFile]);

        // Success!
        console.log("\n" + "=".repeat(60));
        console.log("✓ IMAGE UPLOADED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log(`\nImage URI: ${imageUri}`);
        console.log("\n⚠️  SAVE THIS URI! You'll need it for nft_metadata.ts");
        console.log("\nNext step: Update nft_metadata.ts with this URI and run:");
        console.log("  yarn nft_metadata");
        console.log("=".repeat(60));

    } catch (error) {
        console.error("\n❌ Error uploading image:", error);
        console.log("\nTroubleshooting:");
        console.log("  1. Make sure your wallet has enough SOL");
        console.log("  2. Check that generug.png exists in the ts/ folder");
        console.log("  3. Verify your internet connection");
    }
})();
