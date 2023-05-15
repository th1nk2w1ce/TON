import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type SecondaryJettonWalletConfig = {
    owner: Address;
    minter: Address;
    walletCode: Cell;
};

export function secondaryJettonWalletConfigToCell(config: SecondaryJettonWalletConfig): Cell {
    return beginCell()
        .storeCoins(0)
        .storeAddress(config.owner)
        .storeAddress(config.minter)
        .storeRef(config.walletCode)
        .endCell();
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

    async sendTransfer(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        forwardValue: bigint,
        recipient: Address,
        amount: bigint
    ) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x0f8a7ea5, 32)
                .storeUint(0, 64)
                .storeCoins(amount)
                .storeAddress(recipient)
                .storeAddress(via.address)
                .storeUint(0, 1)
                .storeCoins(forwardValue)
                .storeUint(0, 1)
                .endCell(),
            value: value + forwardValue,
        });
    }

    async getJettonBalance(provider: ContractProvider) {
        let state = await provider.getState();
        if (state.state.type !== 'active') {
            return 0n;
        }
        let res = await provider.get('get_wallet_data', []);
        return res.stack.readBigNumber();
    }
}
