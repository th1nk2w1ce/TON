import { toNano } from 'ton-core';
import { SecondaryJetton } from '../wrappers/SecondaryJetton';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const secondaryJetton = provider.open(SecondaryJetton.createFromConfig({}, await compile('SecondaryJetton')));

    await secondaryJetton.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(secondaryJetton.address);

    // run methods on `secondaryJetton`
}
