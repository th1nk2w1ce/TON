import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type SecondaryJettonWalletConfig = {};

export function secondaryJettonWalletConfigToCell(config: SecondaryJettonWalletConfig): Cell {
    return beginCell().endCell();
}

export class SecondaryJettonWallet implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new SecondaryJettonWallet(address);
    }

    static createFromConfig(config: SecondaryJettonWalletConfig, code: Cell, workchain = 0) {
        const data = secondaryJettonWalletConfigToCell(config);
        const init = { code, data };
        return new SecondaryJettonWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
