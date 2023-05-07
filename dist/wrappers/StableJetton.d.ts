import { Address, Cell, Contract, ContractProvider, Sender } from 'ton-core';
export type StableJettonConfig = {};
export declare function stableJettonConfigToCell(config: StableJettonConfig): Cell;
export declare class StableJetton implements Contract {
    readonly address: Address;
    readonly init?: {
        code: Cell;
        data: Cell;
    } | undefined;
    constructor(address: Address, init?: {
        code: Cell;
        data: Cell;
    } | undefined);
    static createFromAddress(address: Address): StableJetton;
    static createFromConfig(config: StableJettonConfig, code: Cell, workchain?: number): StableJetton;
    sendDeploy(provider: ContractProvider, via: Sender, value: bigint): Promise<void>;
}
