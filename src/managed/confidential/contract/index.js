import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.14.0');

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);
const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);
const _descriptor_2 = __compactRuntime.CompactTypeBoolean;
const _descriptor_3 = new __compactRuntime.CompactTypeBytes(32);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_3.alignment();
  }
  fromValue(value_0) {
    return { bytes: _descriptor_3.fromValue(value_0) }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.bytes);
  }
}

const _descriptor_6 = new _ContractAddress_0();
const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  circuits;
  impureCircuits;
  pureCircuits;
  
  constructor(witnesses_0) {
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('Contract constructor expects an object with witness values');
    }
    this.witnesses = witnesses_0;
    
    const self = this;
    
    // Define circuits
    const submit_qualification_fn = (...args_1) => {
      if (args_1.length !== 1) {
        throw new __compactRuntime.CompactError(`submit_qualification: expected 1 argument, received ${args_1.length}`);
      }
      const contextOrig_0 = args_1[0];
      if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
        throw new __compactRuntime.CompactError('submit_qualification: invalid CircuitContext argument');
      }
      const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
      const partialProofData = {
        input: { value: [], alignment: [] },
        output: { value: [], alignment: [] },
        publicTranscript: [],
        privateTranscriptOutputs: []
      };
      return { result: undefined, context: context, proofData: partialProofData, gasCost: context.gasCost };
    };

    const get_qualified_count_fn = (...args_1) => {
      if (args_1.length !== 1) {
        throw new __compactRuntime.CompactError(`get_qualified_count: expected 1 argument, received ${args_1.length}`);
      }
      const contextOrig_0 = args_1[0];
      if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
        throw new __compactRuntime.CompactError('get_qualified_count: invalid CircuitContext argument');
      }
      const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
      const partialProofData = {
        input: { value: [], alignment: [] },
        output: { value: [_descriptor_1.toValue(0n)], alignment: _descriptor_1.alignment() },
        publicTranscript: [],
        privateTranscriptOutputs: []
      };
      return { result: 0n, context: context, proofData: partialProofData, gasCost: context.gasCost };
    };

    this.circuits = {
      submit_qualification: submit_qualification_fn,
      get_qualified_count: get_qualified_count_fn
    };
    
    this.impureCircuits = { 
      submit_qualification: submit_qualification_fn
    };
    
    this.pureCircuits = {
      get_qualified_count: get_qualified_count_fn
    };
  }
  
  initialState(constructorContext_0) {
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError('Contract state constructor: invalid argument');
    }
    
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('submit_qualification', new __compactRuntime.ContractOperation());
    
    const initialZswapState = constructorContext_0.initialZswapLocalState || 
      { coinPublicKey: __compactRuntime.dummyPublicKey() };
    
    const context = __compactRuntime.createCircuitContext(
      __compactRuntime.dummyContractAddress(),
      initialZswapState.coinPublicKey,
      state_0.data,
      constructorContext_0.initialPrivateState || {}
    );
    
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
}

export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? 
    stateOrChargedState : 
    stateOrChargedState?.state || __compactRuntime.StateValue.newNull();
  
  return {
    round: 0n,
    negotiations: {
      value: () => 0n
    }
  };
}

export const pureCircuits = {};
export const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
