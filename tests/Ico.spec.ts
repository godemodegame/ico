import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { Ico } from '../wrappers/Ico';
import { JettonMaster, JettonWallet } from 'ton';
import '@ton-community/test-utils';

describe('Ico', () => {
    let blockchain: Blockchain;
    let ico: SandboxContract<Ico>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        let jettonMaster = blockchain.openContract(JettonWallet);
        ico = blockchain.openContract(await Ico.fromInit());

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await ico.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ico.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and ico are ready to use
    });
});
