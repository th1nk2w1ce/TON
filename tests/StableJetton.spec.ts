import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { StableJetton } from '../wrappers/StableJetton';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { StableJettonWallet } from '../wrappers/StableJettonWallet';

describe('StableJetton', () => {
    let minterCode: Cell;
    let walletCode: Cell;

    beforeAll(async () => {
        minterCode = await compile('StableJetton');
        walletCode = await compile('StableJettonWallet');
    });

    let blockchain: Blockchain;
    let jetton: SandboxContract<StableJetton>;
    let wallets: SandboxContract<TreasuryContract>[];

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        wallets = await blockchain.createWallets(10);

        jetton = blockchain.openContract(
            StableJetton.createFromConfig(
                {
                    admin: wallets[0].address,
                    content: Cell.EMPTY,
                    walletCode,
                },
                minterCode
            )
        );
        const deployResult = await jetton.sendDeploy(wallets[0].getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: wallets[0].address,
            to: jetton.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {});

    it('should mint', async () => {
        await jetton.sendMint(
            wallets[0].getSender(),
            toNano('0.05'),
            toNano('0.01'),
            wallets[1].address,
            toNano('100')
        );
        const wallet = blockchain.openContract(
            StableJettonWallet.createFromAddress(await jetton.getWalletAddressOf(wallets[1].address))
        );
        expect(await wallet.getJettonBalance()).toEqual(toNano('100'));
    });

    it('should transfer', async () => {
        await jetton.sendMint(
            wallets[0].getSender(),
            toNano('0.05'),
            toNano('0.01'),
            wallets[1].address,
            toNano('100')
        );
        const wallet = blockchain.openContract(
            StableJettonWallet.createFromAddress(await jetton.getWalletAddressOf(wallets[1].address))
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
            StableJettonWallet.createFromAddress(await jetton.getWalletAddressOf(wallets[2].address))
        );
        expect(await secondWallet.getJettonBalance()).toEqual(toNano('30'));
    });
});
