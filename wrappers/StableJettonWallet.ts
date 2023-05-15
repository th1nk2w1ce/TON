import { JettonWallet, JettonWalletConfig, JettonWalletConfigToCell } from './JettonWallet';
import { Address, Cell, Contract, contractAddress } from 'ton-core';

export class StableJettonWallet extends JettonWallet implements Contract {
    static createFromAddress(address: Address) {
        return new StableJettonWallet(address);
    }

    static createFromConfig(config: JettonWalletConfig, code: Cell, workchain = 0) {
        const data = JettonWalletConfigToCell(config);
        const init = { code, data };
        return new StableJettonWallet(contractAddress(workchain, init), init);
    }
}
