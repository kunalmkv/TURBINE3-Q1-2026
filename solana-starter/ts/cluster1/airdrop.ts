import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import wallet from "./wallet/dev-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a Solana devnet connection
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

(async () => {
    try {
        // Check current balance
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);

        if (balance >= 0.5 * LAMPORTS_PER_SOL) {
            console.log(`Sufficient balance, skipping airdrop.`);
            return;
        }

        console.log(`Requesting airdrop of 2 SOL...`);
        const txhash = await connection.requestAirdrop(
            keypair.publicKey,
            2 * LAMPORTS_PER_SOL
        );
        
        // Wait for confirmation
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            signature: txhash,
            ...latestBlockhash,
        });

        const newBalance = await connection.getBalance(keypair.publicKey);
        console.log(`Success! New balance: ${newBalance / LAMPORTS_PER_SOL} SOL`);
        console.log(`Check out your TX here:`);
        console.log(`https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`);
        console.log(`\nManually airdrop using:`);
        console.log(`solana airdrop 2 ${keypair.publicKey.toBase58()} --url devnet`);
        console.log(`Or use: https://faucet.solana.com/`);
    }
})();
