import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Generate a new keypair
const kp = Keypair.generate();

// Wallet file path
const walletDir = path.join(__dirname, "wallet");
const walletFile = path.join(walletDir, "dev-wallet.json");

// Create wallet directory if it doesn't exist
if (!fs.existsSync(walletDir)) {
    fs.mkdirSync(walletDir, { recursive: true });
}

// Save the wallet
fs.writeFileSync(walletFile, JSON.stringify(Array.from(kp.secretKey)));

console.log(`You've generated a new Solana wallet!`);
console.log(`Public Key: ${kp.publicKey.toBase58()}`);
console.log(`\nWallet saved to: ${walletFile}`);
console.log(`\nNext steps:`);
console.log(`1. Run: yarn airdrop`);
console.log(`2. Run: yarn spl_init`);
