import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type SecondaryJettonConfig = {};

export function secondaryJettonConfigToCell(config: SecondaryJettonConfig): Cell {
    return beginCell().endCell();
}

export class SecondaryJetton implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new SecondaryJetton(address);
    }

    static createFromConfig(config: SecondaryJettonConfig, code: Cell, workchain = 0) {
        const data = secondaryJettonConfigToCell(config);
        const init = { code, data };
        return new SecondaryJetton(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
