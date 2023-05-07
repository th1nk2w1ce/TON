import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { StableJetton } from '../wrappers/StableJetton';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('StableJetton', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('StableJetton');
    });

    let blockchain: Blockchain;
    let stableJetton: SandboxContract<StableJetton>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        stableJetton = blockchain.openContract(StableJetton.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await stableJetton.sendDeploy(deployer.getSender(), toNano('0.05'));

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
