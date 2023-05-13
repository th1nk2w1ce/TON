import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { SecondaryJetton } from '../wrappers/SecondaryJetton';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('SecondaryJetton', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SecondaryJetton');
    });

    let blockchain: Blockchain;
    let secondaryJetton: SandboxContract<SecondaryJetton>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        secondaryJetton = blockchain.openContract(SecondaryJetton.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await secondaryJetton.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: secondaryJetton.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and secondaryJetton are ready to use
    });
});
