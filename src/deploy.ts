import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import pino from 'pino';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getConfig } from './config.js';
import { ensureDust } from './dust.js';
import { createProviders } from './providers.js';
import {
  createWallet,
  resolveDeploySeed,
  waitForSyncedWallet,
} from './wallet.js';
import { CompiledGhostEconomyContract, zkConfigPath } from '../contracts/index.js';
import { ghostEconomyPrivateStateKey } from '../contracts/constants.js';
import {
  createInitialPrivateState,
  uniformMonthlyIncome,
} from '../contracts/witnesses.js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

const WORKER_SECRET = new Uint8Array(32).fill(0x0a);
const MONTHLY_INCOME_CENTS = 250_000;

async function main() {
  const config = getConfig();
  const seed = resolveDeploySeed(config.networkId);
  setNetworkId(config.networkId);

  logger.info(`Deploying on ${config.networkId}`);
  if (config.networkId === 'preview' || config.networkId === 'preprod') {
    logger.info('Ensure proof server is running at http://127.0.0.1:6300');
  } else {
    logger.info('Using local endpoints (run yarn env:up if needed)');
    if (process.env['USE_CUSTOM_WALLET'] !== '1') {
      logger.info('Using genesis wallet (pre-funded on local devnet)');
    }
  }

  const walletCtx = await createWallet(config, seed);
  await waitForSyncedWallet(walletCtx.wallet, 600_000);
  await ensureDust(walletCtx);

  const providers = createProviders(walletCtx, zkConfigPath, config, 'deploy');

  const deployed: any = await (deployContract as any)(providers, {
    compiledContract: CompiledGhostEconomyContract,
    privateStateId: ghostEconomyPrivateStateKey,
    initialPrivateState: createInitialPrivateState(
      WORKER_SECRET,
      uniformMonthlyIncome(MONTHLY_INCOME_CENTS),
    ),
    args: [],
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  logger.info(`Contract deployed at: ${contractAddress}`);

  const deploymentRecord = {
    network: config.networkId,
    contractAddress,
    deployedAt: new Date().toISOString(),
  };

  const outPath = resolve(process.cwd(), 'deployment.json');
  writeFileSync(outPath, JSON.stringify(deploymentRecord, null, 2));
  logger.info(`Wrote ${outPath}`);

  await walletCtx.wallet.stop();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
