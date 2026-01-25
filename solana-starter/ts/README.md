# Solana SPL Token with Transfer Fee (Token-2022)

Scripts for creating and managing SPL tokens with transfer fees on Solana devnet.

## Setup

```bash
cd ts
yarn install
```

## Usage

### Step 1: Generate a Wallet

```bash
yarn cluster1:keygen
```

This creates a new wallet and saves it to `cluster1/wallet/dev-wallet.json`.

### Step 2: Fund the Wallet

```bash
yarn cluster1:airdrop
```

Requests 2 SOL from the devnet faucet. If rate-limited, manually fund using:
- https://faucet.solana.com/
- `solana airdrop 2 <YOUR_ADDRESS> --url devnet`

### Step 3: Create Token with Transfer Fee

```bash
yarn spl_init
```

Creates a new Token-2022 SPL token with:
- **1% transfer fee** (100 basis points)
- 9 decimals
- Transfer fee config authority
- Withdraw withheld authority

**Save the mint address** that's printed - you'll need it for the next steps.

### Step 4: Mint Tokens

1. Edit `cluster1/spl_mint.ts` and update the `mint` address:
   ```typescript
   const mint = new PublicKey("<YOUR_MINT_ADDRESS>");
   ```

2. Run:
   ```bash
   yarn spl_mint
   ```

### Step 5: Transfer Tokens (with fee)

1. Edit `cluster1/spl_transfer.ts` and update:
   ```typescript
   const mint = new PublicKey("<YOUR_MINT_ADDRESS>");
   const to = new PublicKey("<RECEIVER_ADDRESS>");
   ```

2. Run:
   ```bash
   yarn spl_transfer
   ```

## Project Structure

```
ts/
├── cluster1/
│   ├── wallet/
│   │   └── dev-wallet.json     # Your wallet (gitignored)
│   ├── keygen.ts               # Generate wallet
│   ├── airdrop.ts              # Fund wallet
│   ├── spl_init.ts             # Create Token-2022 with transfer fee
│   ├── spl_mint.ts             # Mint tokens
│   └── spl_transfer.ts         # Transfer with fee
├── package.json
├── tsconfig.json
└── .gitignore
```

## Transfer Fee Details

| Setting | Value |
|---------|-------|
| Fee | 1% (100 basis points) |
| Max Fee | 1,000,000,000 smallest units |
| Decimals | 9 |
| Program | Token-2022 (TOKEN_2022_PROGRAM_ID) |

### How Transfer Fees Work

1. When tokens are transferred, the fee is **withheld** from the recipient's account
2. The withheld fees can be **harvested** to the mint account
3. The **withdraw authority** can then withdraw the collected fees

## Scripts Reference

| Command | Description |
|---------|-------------|
| `yarn cluster1:keygen` | Generate new wallet |
| `yarn cluster1:airdrop` | Fund wallet with SOL |
| `yarn spl_init` | Create Token-2022 with transfer fee |
| `yarn spl_mint` | Mint tokens to your account |
| `yarn spl_transfer` | Transfer tokens (fee applied) |

## Security

- Wallet files (`*wallet.json`) are gitignored
- Never commit private keys to version control
- The `cluster1/wallet/` folder has its own `.gitignore`
