import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type SecondaryJettonConfig = {
    admin: Address;
    content: Cell;
    walletCode: Cell;
};

export function secondaryJettonConfigToCell(config: SecondaryJettonConfig): Cell {
    return beginCell()
        .storeCoins(0)
        .storeAddress(config.admin)
        .storeRef(config.content)
        .storeRef(config.walletCode)
        .endCell();
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

    async sendMint(
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
                .storeUint(21, 32)
                .storeUint(0, 64)
                .storeAddress(recipient)
                .storeCoins(forwardValue)
                .storeRef(
                    beginCell()
                        .storeUint(0x178d4519, 32)
                        .storeUint(0, 64)
                        .storeCoins(amount)
                        .storeAddress(this.address)
                        .storeAddress(this.address)
                        .storeCoins(0)
                        .storeUint(0, 1)
                        .endCell()
                )
                .endCell(),
            value: value + forwardValue,
        });
    }

    async getWalletAddressOf(provider: ContractProvider, address: Address) {
        return (
            await provider.get('get_wallet_address', [
                { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
            ])
        ).stack.readAddress();
    }
}
