"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sandbox_1 = require("@ton-community/sandbox");
const ton_core_1 = require("ton-core");
const StableJetton_1 = require("../wrappers/StableJetton");
require("@ton-community/test-utils");
const blueprint_1 = require("@ton-community/blueprint");
describe('StableJetton', () => {
    let code;
    beforeAll(async () => {
        code = await (0, blueprint_1.compile)('StableJetton');
    });
    let blockchain;
    let stableJetton;
    beforeEach(async () => {
        blockchain = await sandbox_1.Blockchain.create();
        stableJetton = blockchain.openContract(StableJetton_1.StableJetton.createFromConfig({}, code));
        const deployer = await blockchain.treasury('deployer');
        const deployResult = await stableJetton.sendDeploy(deployer.getSender(), (0, ton_core_1.toNano)('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: stableJetton.address,
            deploy: true,
            success: true,
        });
    });
    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and stableJetton are ready to use
    });
});
