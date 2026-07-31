import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import { GhostEconomyAPI } from '../api/src/node.js';
import { CompiledGhostEconomyContract, zkConfigPath } from '../contracts/index.js';
import { getConfig } from './config.js';
import { ensureDust } from './dust.js';
import { createProviders } from './providers.js';
import {
  createWallet,
  resolveDeploySeed,
  unshieldedToken,
  waitForSyncedWallet,
} from './wallet.js';
import {
  createInitialPrivateState,
  uniformMonthlyIncome,
} from '../contracts/witnesses.js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const WORKER_SECRET = new Uint8Array(32).fill(0x0a);
const MONTHLY_INCOME_CENTS = 320_000;

type DeploymentRecord = {
  network: string;
  contractAddress: string;
  deployedAt: string;
};

function loadDeployment(): DeploymentRecord {
  const path = resolve(process.cwd(), 'deployment.json');
  if (!existsSync(path)) {
    throw new Error('No deployment.json found. Run yarn deploy:preview first.');
  }
  return JSON.parse(readFileSync(path, 'utf8')) as DeploymentRecord;
}

async function main() {
  const deployment = loadDeployment();
  if (!process.env['MIDNIGHT_NETWORK']) {
    process.env['MIDNIGHT_NETWORK'] =
      deployment.network === 'undeployed' ? 'local' : deployment.network;
  }

  const config = getConfig();
  const seed = resolveDeploySeed(config.networkId);
  setNetworkId(config.networkId);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                 Ghost Economy CLI                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`  Contract: ${deployment.contractAddress}`);
  console.log(`  Network:  ${config.networkId}\n`);

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet(config, seed);
    console.log('  Syncing with network...');
    await waitForSyncedWallet(walletCtx.wallet, 600_000);
    console.log('  ✓ Synced\n');

    const state = await walletCtx.wallet.waitForSyncedState();
    console.log(`  Balance: ${(state.unshielded.balances[unshieldedToken().raw] ?? 0n).toLocaleString()} tNight`);
    console.log(`  DUST:    ${state.dust.balance(new Date()).toLocaleString()}\n`);

    await ensureDust(walletCtx);

    const privateState = createInitialPrivateState(
      WORKER_SECRET,
      uniformMonthlyIncome(MONTHLY_INCOME_CENTS),
    );
    const providers = createProviders(walletCtx, zkConfigPath, config, 'cli');
    const api = await GhostEconomyAPI.join(
      providers,
      deployment.contractAddress,
      privateState,
      CompiledGhostEconomyContract,
    );
    const previews = GhostEconomyAPI.commitmentPreviews(privateState);
    console.log(`  Profile commitment preview: ${previews.profile}`);
    console.log(`  Worker commitment preview:  ${previews.worker}\n`);

    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Register income profile');
      console.log('  2. List profiles (on-chain)');
      console.log('  3. Show commitment previews');
      console.log('  4. Exit\n');

      const choice = await rl.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          const minStr = await rl.question('  Min monthly cents (default 200000): ');
          const reqStr = await rl.question('  Required consecutive months (default 6): ');
          const minMonthlyCents = Number(minStr.trim() || '200000');
          const requiredMonths = Number(reqStr.trim() || '6');
          console.log('\n  Submitting registerIncomeProfile...');
          try {
            await api.registerIncomeProfile(minMonthlyCents, requiredMonths);
            console.log('\n  ✅ Profile registered\n');
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }
        case '2': {
          try {
            const registry = await GhostEconomyAPI.fetchRegistryState(
              config.indexer,
              deployment.contractAddress,
              config.networkId as any,
            );
            if (registry.entries.length === 0) {
              console.log('\n  📋 No profiles yet.\n');
              break;
            }
            registry.entries.forEach((e, i) => {
              console.log(`  ${i + 1}. ${e.profileCommitment} — ${e.tierLabel} (${e.consistencyMonths} mo)`);
            });
            console.log('');
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }
        case '3':
          console.log(`\n  Profile: ${previews.profile}`);
          console.log(`  Worker:  ${previews.worker}\n`);
          break;
        case '4':
          running = false;
          break;
        default:
          console.log('\n  ❌ Invalid choice.\n');
      }
    }

    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main().catch(console.error);
