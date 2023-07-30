import { 
    Blockchain, 
    SandboxContract, 
    TreasuryContract 
} from '@ton-community/sandbox';
import { toNano, beginCell, fromNano } from 'ton-core';
import { Ico } from '../wrappers/Ico';
import '@ton-community/test-utils';
import { JettonRoot } from '../wrappers/JettonRoot';


describe('Ico', () => {
    let blockchain: Blockchain;
    let ico: SandboxContract<Ico>;
    let jettonRoot: SandboxContract<JettonRoot>;
    let deployer: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;
    let rate = 1n;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        owner = await blockchain.treasury('owner');

        // deploy jetton master
        jettonRoot = blockchain.openContract(
            JettonRoot.createFromConfig(
                {
                    owner: owner.address,
                }
            )
        );

        const deployJettonRootResult = await jettonRoot
            .sendDeploy(owner.getSender());

        ico = blockchain.openContract(
            await Ico.fromInit(rate)
        );

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

        ico.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'ChangeJettonWallet',
                address: await jettonRoot.getWalletAddress(ico.address)
            }
        )
    
        const mintResult = await jettonRoot.send(
            owner.getSender(),
            toNano('0.1'),
            beginCell()
                .storeUint(21, 32)
                .storeUint(0, 64)
                .storeAddress(owner.address)
                .storeCoins(toNano('0.07'))
                .storeRef(
                    beginCell()
                        .storeUint(0x178d4519, 32)
                        .storeUint(0, 64)
                        .storeCoins(toNano('1000000'))
                        .storeAddress(null)
                        .storeAddress(null)
                        .storeCoins(toNano('0.02'))
                        .storeUint(0, 1)
                        .endCell()
                )
                .endCell()
        );
        
        console.log("mintResult = ", mintResult.transactions)
        expect(mintResult.transactions).toHaveTransaction({
            from: owner.address,
            to: jettonRoot.address,
            success: true,
        });
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ico.address,
            deploy: true,
            success: true,
        });
        expect(deployJettonRootResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonRoot.address,
            deploy: true,
            success: true,
        });
    });

    it('should change jetton wallet', async () => {
        expect(
            await ico.getJettonWallet()
        ).toEqualAddress(
            await jettonRoot.getWalletAddress(ico.address)
        );
    });

    it('should mint tokens', async () => {
        expect(
            fromNano(await jettonRoot.getSupply())
        ).toBe("1000000")
    });

    it('should deposit jettons', async () => {
        await owner.send({
            'to': owner.address,
            'value': toNano('0.5'),
            'body': beginCell()
                .storeUint(0xf8a7ea5, 32)
                .storeUint(0, 64)
                .storeCoins(toNano('1000'))
                .storeAddress(ico.address)
                .storeAddress(owner.address)
                .storeUint(0, 1)
                .storeCoins(toNano('0.2'))
                .storeUint(0, 1)
                .endCell()
        });
        console.log("amount: ", ico.getAmount)
    });
});
