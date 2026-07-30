# Ghost Economy

ZK-verified private proof-of-income for the gig economy on [Midnight Network](https://midnight.network). Workers prove income stability and eligibility thresholds without revealing amounts, platforms, or individual transactions. Financial institutions receive only the compliance signals they need; workers keep full data sovereignty.

## Product idea

**1.5 billion people** globally have income but no credit. Gig workers, freelancers, and informal-economy workers cannot get loans, leases, or financial services because they cannot prove income without violating privacy or exposing their entire financial history.

**Ghost Economy** is a ZK income-verification protocol where agents aggregate private income streams (Uber, Upwork, Shopify, cash, etc.), generate a proof that *"this person earns above $X monthly, consistently, for Y months"* — without revealing the amount, the platforms, or specific transactions. Financial institutions query the proof and receive exactly the compliance signal they need.

## Hackathon level

| Level | Codename | Status |
|-------|----------|--------|
| **L1** | New Moon | Complete |
| **L2** | Waxing Crescent | Complete |
| L3 | First Quarter | Not started |

## Prerequisites

- **Node.js 22+**
- **Docker** (local devnet + proof server)
- **Compact compiler** 0.31.1 (`compact update 0.31.1`)
- **Yarn 1.22**
- **Lace** or **1AM** browser wallet (for the web dApp)

### Install Compact

```bash
curl --proto '=https' --tlsv1.2 -sSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source $HOME/.local/bin/env
compact update 0.31.1
compact compile --version
```

## Setup

```bash
yarn setup:l1
```

Or manually:

```bash
yarn install
yarn compile
yarn env:up
yarn test:local
```

If port 6300 is in use, `yarn env:up` starts node + indexer only; keep a proof server on `http://127.0.0.1:6300`.

## Level 2 frontend

Vite + React dApp with storyline landing, Lace/1AM connect-disconnect, local deploy/join, and `registerIncomeProfile`.

```bash
yarn env:up                 # node + indexer (proof server on :6300)
yarn sync:zk                # copy managed ZK assets into web/public
yarn web:install
yarn web:dev                # http://localhost:5173
```

| Route | Purpose |
|-------|---------|
| `/` | Night-city storyline landing |
| `/app` | Wallet, deploy/join, private income form, `registerIncomeProfile` |
| `/registry` | Public profiles (tier + consistency only) |
| `/privacy` | Observer vs worker vs lender model |

Point Lace / 1AM at the **undeployed** local network for development. After proving, the registry shows Gold / Silver / Bronze and month counts - never the dollar amounts typed in the form.

```bash
yarn web:build              # production build
yarn verify:l2              # sync + test:local + web build
```

## Deploy

### Preprod status: currently unstable

Preprod deploy flow is available but currently unstable. Use it for manual validation only; prefer local `undeployed` for deterministic development checks.

### Local undeployed devnet

```bash
yarn env:up
yarn deploy:undeployed
```

Uses the pre-funded genesis wallet. Address is written to [`deployment.json`](deployment.json).

### Preprod

Fund a wallet via the [Preprod faucet](https://faucet.preprod.midnight.network), then:

```bash
export WALLET_SEED="<your-funded-preprod-seed-or-mnemonic>"
yarn deploy:preprod
```

Ensure `midnightntwrk/proof-server:8.0.3` is running locally on port 6300.

### Deploy command reference

```bash
# Local / undeployed (alias for legacy `yarn deploy`)
yarn deploy:undeployed

# Preprod
yarn deploy:preprod
```

## Public state vs private witness

| Data | Visibility | Where |
|------|------------|-------|
| `workerSecret` | **Private** | Witness + local private state |
| `monthlyIncomeCents` (12 months) | **Private** | Witness only |
| `profileCommitment` | **Public** | `profiles` map key |
| `workerCommitment` | **Public** | `ProfileEntry.workerCommitment` |
| `incomeTier` (0–3 bucket) | **Public** | `ProfileEntry.incomeTier` |
| `consistencyMonths` | **Public** | `ProfileEntry.consistencyMonths` |
| `minMonthlyCents`, `requiredMonths` | **Public** | Circuit arguments (floor the worker chose to prove against) |

**What an observer learns:** a worker registered a profile at a disclosed income floor with a coarse tier (Bronze/Silver/Gold) and consistency count. They **cannot** recover monthly dollar amounts, income platforms, or individual transactions from chain data alone.

**Privacy claim (L2):** the Prove form accepts exact monthly USD values. After `registerIncomeProfile` confirms, the Registry page shows only truncated commitments, a tier badge, and consistency months.

**L1 limitation:** income is self-attested via witness (no third-party attestation yet).

## Circuits

| Circuit | Purpose |
|---------|---------|
| `workerCommitment(sk)` | `persistentHash` with domain `"ge:worker:"` |
| `profileCommitment(incomes)` | `persistentHash` with domain `"ge:profile:"` over 12-month vector |
| `registerIncomeProfile(minMonthlyCents, requiredMonths)` | Validates witness incomes ≥ floor for consecutive months; computes tier; inserts `ProfileEntry` |

Tier buckets (circuit constants): Bronze ≥ 3 consecutive months, Silver ≥ 6, Gold ≥ 12.

## Project structure

```
contracts/
  ghost-economy.compact
  witnesses.ts
  managed/ghost-economy/
web/
  src/pages/          # Story, Prove, Registry, Privacy
  src/lib/            # Lace connector + circuit helpers
  public/zk/          # synced from managed/
src/
  test/ghost-economy.test.ts
  deploy.ts
scripts/
  setup-l1.sh
  sync-zk-assets.mjs
```

## Evidence (L1 submission)

See [`docs/screenshots/`](docs/screenshots/):

- `compile-output.txt` — `yarn compile` listing `registerIncomeProfile`
- `test-local-output.txt` — 4/4 vitest tests passing
- `deploy-output.txt` — deploy with contract address

## Deployed contract

| Network | Contract address |
|---------|------------------|
| undeployed (local) | see [`deployment.json`](deployment.json) |

Preprod: run `yarn deploy:preprod` with a funded `WALLET_SEED` (not configured in this repo).

## License

MIT
