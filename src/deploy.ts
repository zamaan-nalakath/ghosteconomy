import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import pino from 'pino';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getConfig } from './config.js';
import { ensureDust } from './dust.js';
import {
  MidnightWalletProvider,
  resolveDeploySeed,
  syncWallet,
} from './wallet.js';
import { buildProviders } from './providers.js';
import {
  CompiledGhostEconomyContract,
  zkConfigPath,
} from '../contracts/index.js';
import {
  createInitialPrivateState,
  uniformMonthlyIncome,
} from '../contracts/witnesses.js';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

const PRIVATE_STATE_ID = 'GhostEconomyDeployState';
const WORKER_SECRET = new Uint8Array(32).fill(0x0a);
const MONTHLY_INCOME_CENTS = 250_000;

async function main() {
  const config = getConfig();
  const seed = resolveDeploySeed(config.networkId);
  setNetworkId(config.networkId);

  const envConfig: EnvironmentConfiguration = {
    walletNetworkId: config.networkId,
    networkId: config.networkId,
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    faucet: config.faucet,
    proofServer: config.proofServer,
  };

  logger.info(`Deploying on ${config.networkId} (run yarn env:up first for local)`);
  if (config.networkId === 'undeployed' && process.env['USE_CUSTOM_WALLET'] !== '1') {
    logger.info('Using genesis wallet (pre-funded on local devnet)');
  }

  const wallet = await MidnightWalletProvider.build(logger, envConfig, seed);
  await wallet.start();
  await syncWallet(logger, wallet.wallet, 600_000);
  await ensureDust(logger, wallet.wallet, wallet.unshieldedKeystore);

  const providers = buildProviders(wallet, zkConfigPath, config, 'deploy');

  const deployed: any = await (deployContract as any)(providers, {
    compiledContract: CompiledGhostEconomyContract,
    privateStateId: PRIVATE_STATE_ID,
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

  await wallet.stop();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
