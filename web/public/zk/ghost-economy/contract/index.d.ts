import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  workerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  monthlyIncomeCents(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint[]];
}

export type ImpureCircuits<PS> = {
  registerIncomeProfile(context: __compactRuntime.CircuitContext<PS>,
                        minMonthlyCents_0: bigint,
                        requiredMonths_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  registerIncomeProfile(context: __compactRuntime.CircuitContext<PS>,
                        minMonthlyCents_0: bigint,
                        requiredMonths_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  workerCommitment(sk_0: Uint8Array): Uint8Array;
  profileCommitment(incomes_0: bigint[]): Uint8Array;
}

export type Circuits<PS> = {
  workerCommitment(context: __compactRuntime.CircuitContext<PS>,
                   sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  profileCommitment(context: __compactRuntime.CircuitContext<PS>,
                    incomes_0: bigint[]): __compactRuntime.CircuitResults<PS, Uint8Array>;
  registerIncomeProfile(context: __compactRuntime.CircuitContext<PS>,
                        minMonthlyCents_0: bigint,
                        requiredMonths_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  profiles: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { workerCommitment: Uint8Array,
                                 incomeTier: bigint,
                                 consistencyMonths: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { workerCommitment: Uint8Array, incomeTier: bigint, consistencyMonths: bigint }]>
  };
  readonly nextProfileId: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
