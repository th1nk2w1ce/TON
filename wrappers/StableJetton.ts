import { Address, Cell, Contract, contractAddress } from 'ton-core';
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
}
