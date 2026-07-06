import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  deployContract,
  submitCallTx,
} from '@midnight-ntwrk/midnight-js-contracts';
import type { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import pino from 'pino';

import { getConfig } from '../config.js';
import {
  MidnightWalletProvider,
  GENESIS_WALLET_SEED,
  syncWallet,
} from '../wallet.js';
import { buildProviders, type GhostEconomyProviders } from '../providers.js';
import {
  CompiledGhostEconomyContract,
  ledger,
  pureCircuits,
  zkConfigPath,
} from '../../contracts/index.js';
import {
  createInitialPrivateState,
  uniformMonthlyIncome,
} from '../../contracts/witnesses.js';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const ALICE_SEED = GENESIS_WALLET_SEED;
const ALICE_PRIVATE_STATE_ID = 'AliceGhostEconomyState';
const LOW_INCOME_PRIVATE_STATE_ID = 'LowIncomeGhostEconomyState';

const WORKER_SECRET = new Uint8Array(32).fill(0x01);
const LOW_INCOME_SECRET = new Uint8Array(32).fill(0x02);
const MONTHLY_INCOME_CENTS = 250_000;
const MIN_MONTHLY_CENTS = 200_000;
const REQUIRED_MONTHS = 6;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

describe('Ghost Economy Contract', () => {
  let aliceWallet: MidnightWalletProvider;
  let aliceProviders: GhostEconomyProviders;
  let contractAddress: ContractAddress;
  let expectedProfileCommitment: Uint8Array;

  const config = getConfig();

  async function queryLedger(providers: GhostEconomyProviders) {
    const state =
      await providers.publicDataProvider.queryContractState(contractAddress);
    expect(state).not.toBeNull();
    return ledger(state!.data);
  }

  beforeAll(async () => {
    setNetworkId(config.networkId);

    const incomes = uniformMonthlyIncome(MONTHLY_INCOME_CENTS);
    expectedProfileCommitment = pureCircuits.profileCommitment(
      incomes.map((v) => v),
    );

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

    aliceWallet = await MidnightWalletProvider.build(
      logger,
      envConfig,
      ALICE_SEED,
    );
    await aliceWallet.start();
    await syncWallet(logger, aliceWallet.wallet, 600_000);

    aliceProviders = buildProviders(aliceWallet, zkConfigPath, config);
    logger.info('Providers initialized. Ready to test!');
  });

  afterAll(async () => {
    if (aliceWallet) {
      logger.info('Stopping Alice wallet...');
      await aliceWallet.stop();
    }
  });

  it('deploys the contract', async () => {
    const deployed: any = await (deployContract as any)(aliceProviders, {
      compiledContract: CompiledGhostEconomyContract,
      privateStateId: ALICE_PRIVATE_STATE_ID,
      initialPrivateState: createInitialPrivateState(
        WORKER_SECRET,
        uniformMonthlyIncome(MONTHLY_INCOME_CENTS),
      ),
      args: [],
    });

    contractAddress = deployed.deployTxData.public.contractAddress;
    logger.info(`Contract deployed at: ${contractAddress}`);
    expect(contractAddress).toBeDefined();
    expect(contractAddress.length).toBeGreaterThan(0);

    const state = await queryLedger(aliceProviders);
    expect(state.nextProfileId).toEqual(0n);
  });

  it('registers income profile with disclosed commitments only', async () => {
    await (submitCallTx as any)(aliceProviders, {
      compiledContract: CompiledGhostEconomyContract,
      contractAddress,
      privateStateId: ALICE_PRIVATE_STATE_ID,
      circuitId: 'registerIncomeProfile',
      args: [BigInt(MIN_MONTHLY_CENTS), BigInt(REQUIRED_MONTHS)],
    });

    const state = await queryLedger(aliceProviders);
    expect(state.nextProfileId).toEqual(1n);
    expect(state.profiles.member(expectedProfileCommitment)).toBe(true);

    const entry = state.profiles.lookup(expectedProfileCommitment);
    expect(entry.incomeTier).toEqual(3n);
    expect(entry.consistencyMonths).toEqual(12n);
    expect(entry.workerCommitment).toEqual(
      pureCircuits.workerCommitment(WORKER_SECRET),
    );
  });

  it('rejects duplicate profile registration', async () => {
    await expect(
      (submitCallTx as any)(aliceProviders, {
        compiledContract: CompiledGhostEconomyContract,
        contractAddress,
        privateStateId: ALICE_PRIVATE_STATE_ID,
        circuitId: 'registerIncomeProfile',
        args: [BigInt(MIN_MONTHLY_CENTS), BigInt(REQUIRED_MONTHS)],
      }),
    ).rejects.toThrow();
  });

  it('rejects insufficient income consistency', async () => {
    const lowIncomeProviders = buildProviders(
      aliceWallet,
      zkConfigPath,
      config,
      'low-income',
    );

    await expect(
      (submitCallTx as any)(lowIncomeProviders, {
        compiledContract: CompiledGhostEconomyContract,
        contractAddress,
        privateStateId: LOW_INCOME_PRIVATE_STATE_ID,
        initialPrivateState: createInitialPrivateState(
          LOW_INCOME_SECRET,
          uniformMonthlyIncome(50_000),
        ),
        circuitId: 'registerIncomeProfile',
        args: [BigInt(MIN_MONTHLY_CENTS), BigInt(REQUIRED_MONTHS)],
      }),
    ).rejects.toThrow();
  });
});
