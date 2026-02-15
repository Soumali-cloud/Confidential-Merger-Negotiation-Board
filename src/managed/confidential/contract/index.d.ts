import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS = any> = {
}

export type ImpureCircuits<PS = any> = {
  submit_qualification(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits<PS = any> = {
  get_qualified_count(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, [bigint]>;
}

export type Circuits<PS = any> = {
  submit_qualification(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  get_qualified_count(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, [bigint]>;
}

export type Ledger = {
  readonly round?: bigint;
  readonly negotiations?: {
    value(): bigint;
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
