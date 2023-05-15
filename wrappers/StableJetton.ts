import { Address, Cell, Contract, ContractProvider, SendMode, Sender, beginCell, contractAddress } from 'ton-core';
import { Jetton, JettonConfig, JettonConfigToCell } from './Jetton';

export class StableJetton extends Jetton implements Contract {
    static createFromAddress(address: Address) {
        return new StableJetton(address);
    }

    static createFromConfig(config: JettonConfig, code: Cell, workchain = 0) {
        const data = JettonConfigToCell(config);
        const init = { code, data };
        return new StableJetton(contractAddress(workchain, init), init);
    }

    async sendMint(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(21, 32).storeUint(0, 64).endCell(),
        });
    }
}
