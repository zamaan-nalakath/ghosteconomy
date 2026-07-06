import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

class _ProfileEntry_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      workerCommitment: _descriptor_0.fromValue(value_0),
      incomeTier: _descriptor_1.fromValue(value_0),
      consistencyMonths: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.workerCommitment).concat(_descriptor_1.toValue(value_0.incomeTier).concat(_descriptor_1.toValue(value_0.consistencyMonths)));
  }
}

const _descriptor_2 = new _ProfileEntry_0();

const _descriptor_3 = __compactRuntime.CompactTypeBoolean;

const _descriptor_4 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_6 = new __compactRuntime.CompactTypeVector(12, _descriptor_5);

const _descriptor_7 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _Either_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_3.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_9 = new _Either_0();

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_11 = new _ContractAddress_0();

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.workerSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named workerSecret');
    }
    if (typeof(witnesses_0.monthlyIncomeCents) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named monthlyIncomeCents');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      workerCommitment(context, ...args_1) {
        return { result: pureCircuits.workerCommitment(...args_1), context };
      },
      profileCommitment(context, ...args_1) {
        return { result: pureCircuits.profileCommitment(...args_1), context };
      },
      registerIncomeProfile: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`registerIncomeProfile: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const minMonthlyCents_0 = args_1[1];
        const requiredMonths_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerIncomeProfile',
                                     'argument 1 (as invoked from Typescript)',
                                     'ghost-economy.compact line 91 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(minMonthlyCents_0) === 'bigint' && minMonthlyCents_0 >= 0n && minMonthlyCents_0 <= 4294967295n)) {
          __compactRuntime.typeError('registerIncomeProfile',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'ghost-economy.compact line 91 char 1',
                                     'Uint<0..4294967296>',
                                     minMonthlyCents_0)
        }
        if (!(typeof(requiredMonths_0) === 'bigint' && requiredMonths_0 >= 0n && requiredMonths_0 <= 255n)) {
          __compactRuntime.typeError('registerIncomeProfile',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'ghost-economy.compact line 91 char 1',
                                     'Uint<0..256>',
                                     requiredMonths_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_5.toValue(minMonthlyCents_0).concat(_descriptor_1.toValue(requiredMonths_0)),
            alignment: _descriptor_5.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerIncomeProfile_0(context,
                                                       partialProofData,
                                                       minMonthlyCents_0,
                                                       requiredMonths_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      registerIncomeProfile: this.circuits.registerIncomeProfile
    };
    this.provableCircuits = {
      registerIncomeProfile: this.circuits.registerIncomeProfile
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('registerIncomeProfile', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(1n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_7, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_6, value_0);
    return result_0;
  }
  _workerSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.workerSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('workerSecret',
                                 'return value',
                                 'ghost-economy.compact line 14 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _monthlyIncomeCents_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.monthlyIncomeCents(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 12 && result_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 4294967295n))) {
      __compactRuntime.typeError('monthlyIncomeCents',
                                 'return value',
                                 'ghost-economy.compact line 15 char 1',
                                 'Vector<12, Uint<0..4294967296>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_6.toValue(result_0),
      alignment: _descriptor_6.alignment()
    });
    return result_0;
  }
  _workerCommitment_0(sk_0) {
    return this._persistentHash_0([new Uint8Array([103, 101, 58, 119, 111, 114, 107, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _hashIncomeVector_0(incomes_0) { return this._persistentHash_1(incomes_0); }
  _profileCommitment_0(incomes_0) {
    return this._persistentHash_0([new Uint8Array([103, 101, 58, 112, 114, 111, 102, 105, 108, 101, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   this._hashIncomeVector_0(incomes_0)]);
  }
  _meetsFloor_0(income_0, floor_0) { return income_0 >= floor_0; }
  _advanceStreak_0(prev_0, meets_0) {
    if (meets_0) {
      return ((t1) => {
               if (t1 > 255n) {
                 throw new __compactRuntime.CompactError('ghost-economy.compact line 35 char 12: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
               }
               return t1;
             })(prev_0 + 1n);
    } else {
      return 0n;
    }
  }
  _maxUint8_0(a_0, b_0) { if (a_0 >= b_0) { return a_0; } else { return b_0; } }
  _maxConsecutiveMonths_0(incomes_0, floor_0) {
    const s0_0 = this._advanceStreak_0(0n,
                                       this._meetsFloor_0(incomes_0[0], floor_0));
    const m0_0 = this._maxUint8_0(0n, s0_0);
    const s1_0 = this._advanceStreak_0(s0_0,
                                       this._meetsFloor_0(incomes_0[1], floor_0));
    const m1_0 = this._maxUint8_0(m0_0, s1_0);
    const s2_0 = this._advanceStreak_0(s1_0,
                                       this._meetsFloor_0(incomes_0[2], floor_0));
    const m2_0 = this._maxUint8_0(m1_0, s2_0);
    const s3_0 = this._advanceStreak_0(s2_0,
                                       this._meetsFloor_0(incomes_0[3], floor_0));
    const m3_0 = this._maxUint8_0(m2_0, s3_0);
    const s4_0 = this._advanceStreak_0(s3_0,
                                       this._meetsFloor_0(incomes_0[4], floor_0));
    const m4_0 = this._maxUint8_0(m3_0, s4_0);
    const s5_0 = this._advanceStreak_0(s4_0,
                                       this._meetsFloor_0(incomes_0[5], floor_0));
    const m5_0 = this._maxUint8_0(m4_0, s5_0);
    const s6_0 = this._advanceStreak_0(s5_0,
                                       this._meetsFloor_0(incomes_0[6], floor_0));
    const m6_0 = this._maxUint8_0(m5_0, s6_0);
    const s7_0 = this._advanceStreak_0(s6_0,
                                       this._meetsFloor_0(incomes_0[7], floor_0));
    const m7_0 = this._maxUint8_0(m6_0, s7_0);
    const s8_0 = this._advanceStreak_0(s7_0,
                                       this._meetsFloor_0(incomes_0[8], floor_0));
    const m8_0 = this._maxUint8_0(m7_0, s8_0);
    const s9_0 = this._advanceStreak_0(s8_0,
                                       this._meetsFloor_0(incomes_0[9], floor_0));
    const m9_0 = this._maxUint8_0(m8_0, s9_0);
    const s10_0 = this._advanceStreak_0(s9_0,
                                        this._meetsFloor_0(incomes_0[10],
                                                           floor_0));
    const m10_0 = this._maxUint8_0(m9_0, s10_0);
    const s11_0 = this._advanceStreak_0(s10_0,
                                        this._meetsFloor_0(incomes_0[11],
                                                           floor_0));
    return this._maxUint8_0(m10_0, s11_0);
  }
  _computeTier_0(consecutiveMonths_0) {
    if (consecutiveMonths_0 >= 12n) {
      return 3n;
    } else {
      if (consecutiveMonths_0 >= 6n) {
        return 2n;
      } else {
        if (consecutiveMonths_0 >= 3n) { return 1n; } else { return 0n; }
      }
    }
  }
  _registerIncomeProfile_0(context,
                           partialProofData,
                           minMonthlyCents_0,
                           requiredMonths_0)
  {
    const sk_0 = this._workerSecret_0(context, partialProofData);
    const incomes_0 = this._monthlyIncomeCents_0(context, partialProofData);
    const workerCommit_0 = this._workerCommitment_0(sk_0);
    const profileCommit_0 = this._profileCommitment_0(incomes_0);
    __compactRuntime.assert(!_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(0n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(profileCommit_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'profile already registered');
    const consistencyMonths_0 = this._maxConsecutiveMonths_0(incomes_0,
                                                             minMonthlyCents_0);
    __compactRuntime.assert(consistencyMonths_0 >= requiredMonths_0,
                            'insufficient income consistency');
    const incomeTier_0 = this._computeTier_0(consistencyMonths_0);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_4.toValue(tmp_0),
                                                                alignment: _descriptor_4.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = { workerCommitment: workerCommit_0,
                    incomeTier: incomeTier_0,
                    consistencyMonths: consistencyMonths_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(0n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(profileCommit_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_1),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    profiles: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                                                                 alignment: _descriptor_8.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'ghost-economy.compact line 11 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'ghost-economy.compact line 11 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_2.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get nextProfileId() {
      return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_1.toValue(1n),
                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  workerSecret: (...args) => undefined,
  monthlyIncomeCents: (...args) => undefined
});
export const pureCircuits = {
  workerCommitment: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`workerCommitment: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('workerCommitment',
                                 'argument 1',
                                 'ghost-economy.compact line 17 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._workerCommitment_0(sk_0);
  },
  profileCommitment: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`profileCommitment: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const incomes_0 = args_0[0];
    if (!(Array.isArray(incomes_0) && incomes_0.length === 12 && incomes_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 4294967295n))) {
      __compactRuntime.typeError('profileCommitment',
                                 'argument 1',
                                 'ghost-economy.compact line 25 char 1',
                                 'Vector<12, Uint<0..4294967296>>',
                                 incomes_0)
    }
    return _dummyContract._profileCommitment_0(incomes_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
