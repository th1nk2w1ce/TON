import { toNano } from 'ton-core';
import { StableJetton } from '../wrappers/StableJetton';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const stableJetton = provider.open(StableJetton.createFromConfig({}, await compile('StableJetton')));

    await stableJetton.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(stableJetton.address);

    // run methods on `stableJetton`
}
