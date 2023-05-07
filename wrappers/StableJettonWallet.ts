import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type StableJettonWalletConfig = {};

export function stableJettonWalletConfigToCell(config: StableJettonWalletConfig): Cell {
    return beginCell().endCell();
}

export class StableJettonWallet implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new StableJettonWallet(address);
    }

    static createFromConfig(config: StableJettonWalletConfig, code: Cell, workchain = 0) {
        const data = stableJettonWalletConfigToCell(config);
        const init = { code, data };
        return new StableJettonWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
