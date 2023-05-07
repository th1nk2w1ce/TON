import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type StableJettonConfig = {};

export function stableJettonConfigToCell(config: StableJettonConfig): Cell {
    return beginCell().endCell();
}

export class StableJetton implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new StableJetton(address);
    }

    static createFromConfig(config: StableJettonConfig, code: Cell, workchain = 0) {
        const data = stableJettonConfigToCell(config);
        const init = { code, data };
        return new StableJetton(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
