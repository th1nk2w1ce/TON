import { Blockchain, SandboxContract, Treasury, TreasuryContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { SecondaryJetton } from '../wrappers/SecondaryJetton';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { SecondaryJettonWallet } from '../wrappers/SecondaryJettonWallet';

describe('SecondaryJetton', () => {
    let minterCode: Cell;
    let walletCode: Cell;

    beforeAll(async () => {
        minterCode = await compile('SecondaryJetton');
        walletCode = await compile('SecondaryJettonWallet');
    });

    let blockchain: Blockchain;
    let secondaryJetton: SandboxContract<SecondaryJetton>;
    let wallets: SandboxContract<TreasuryContract>[];

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        wallets = await blockchain.createWallets(10);

        secondaryJetton = blockchain.openContract(
            SecondaryJetton.createFromConfig(
                {
                    admin: wallets[0].address,
                    content: Cell.EMPTY,
                    walletCode,
                },
                minterCode
            )
        );
        const deployResult = await secondaryJetton.sendDeploy(wallets[0].getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: wallets[0].address,
            to: secondaryJetton.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {});

    it('should mint', async () => {
        await secondaryJetton.sendMint(
            wallets[0].getSender(),
            toNano('0.05'),
            toNano('0.01'),
            wallets[1].address,
            toNano('100')
        );
        const wallet = blockchain.openContract(
            SecondaryJettonWallet.createFromAddress(await secondaryJetton.getWalletAddressOf(wallets[1].address))
        );
        expect(await wallet.getJettonBalance()).toEqual(toNano('100'));
    });

    it('should transfer', async () => {
        await secondaryJetton.sendMint(
            wallets[0].getSender(),
            toNano('0.05'),
            toNano('0.01'),
            wallets[1].address,
            toNano('100')
        );
        const wallet = blockchain.openContract(
            SecondaryJettonWallet.createFromAddress(await secondaryJetton.getWalletAddressOf(wallets[1].address))
        );

        await wallet.sendTransfer(
            wallets[1].getSender(),
            toNano('0.05'),
            toNano('0.01'),
            wallets[2].address,
            toNano('30')
        );

        expect(await wallet.getJettonBalance()).toEqual(toNano('70'));
        const secondWallet = blockchain.openContract(
            SecondaryJettonWallet.createFromAddress(await secondaryJetton.getWalletAddressOf(wallets[2].address))
        );
        expect(await secondWallet.getJettonBalance()).toEqual(toNano('30'));
    });
});
