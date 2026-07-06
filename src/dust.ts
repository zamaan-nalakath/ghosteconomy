import type { WalletFacade, FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';
import type { createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as Rx from 'rxjs';
import type { Logger } from 'pino';

type UnshieldedKeystore = ReturnType<typeof createKeystore>;

function dustBalance(state: FacadeState): bigint {
  return state.dust.balance(new Date());
}

export async function ensureDust(
  logger: Logger,
  wallet: WalletFacade,
  unshieldedKeystore: UnshieldedKeystore,
  timeoutMs = 180_000,
): Promise<void> {
  let state = await wallet.waitForSyncedState();

  if (dustBalance(state) > 0n || state.dust.availableCoins.length > 0) {
    logger.info(`DUST available (balance=${dustBalance(state)})`);
    return;
  }

  const unregistered = state.unshielded.availableCoins.filter(
    (coin) => coin.meta.registeredForDustGeneration !== true,
  );

  if (unregistered.length > 0) {
    logger.info(
      `Registering ${unregistered.length} NIGHT UTXO(s) for DUST generation...`,
    );
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      unregistered,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
    );
    const signed = await wallet.signRecipe(recipe, (payload) =>
      unshieldedKeystore.signData(payload),
    );
    const finalized = await wallet.finalizeRecipe(signed);
    await wallet.submitTransaction(finalized);
    state = await wallet.waitForSyncedState();
  } else {
    logger.info('No unregistered NIGHT UTXOs; waiting for DUST to accrue...');
  }

  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.filter((s) => s.isSynced),
      Rx.filter((s) => dustBalance(s) > 0n || s.dust.availableCoins.length > 0),
      Rx.tap((s) =>
        logger.info(`DUST ready (balance=${dustBalance(s)})`),
      ),
      Rx.timeout({
        first: timeoutMs,
        with: () =>
          Rx.throwError(
            () =>
              new Error(
                `Timed out waiting for DUST after ${timeoutMs}ms. On undeployed, use the genesis wallet (default) or fund NIGHT first.`,
              ),
          ),
      }),
    ),
  );
}
