import { toNano } from 'ton-core';
import { Ico } from '../wrappers/Ico';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const ico = provider.open(await Ico.fromInit());

    await ico.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(ico.address);

    // run methods on `ico`
}
