"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StableJetton = exports.stableJettonConfigToCell = void 0;
const ton_core_1 = require("ton-core");
function stableJettonConfigToCell(config) {
    return (0, ton_core_1.beginCell)().endCell();
}
exports.stableJettonConfigToCell = stableJettonConfigToCell;
class StableJetton {
    constructor(address, init) {
        this.address = address;
        this.init = init;
    }
    static createFromAddress(address) {
        return new StableJetton(address);
    }
    static createFromConfig(config, code, workchain = 0) {
        const data = stableJettonConfigToCell(config);
        const init = { code, data };
        return new StableJetton((0, ton_core_1.contractAddress)(workchain, init), init);
    }
    async sendDeploy(provider, via, value) {
        await provider.internal(via, {
            value,
            sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            body: (0, ton_core_1.beginCell)().endCell(),
        });
    }
}
exports.StableJetton = StableJetton;
