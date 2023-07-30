import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages"; // https://github.com/ton-core/tact/blob/main/stdlib/libs/jetton/messages.tact

contract Ico with Deployable, Ownable {

    // MARK: Variables

    // Wallet to receive jettons;
    jettonWallet: Address;
    // Total amount of jettons received, default is 0
    amount: Int as coins;
    // Amount of ton per 1 * 10^9 jetton
    rate: Int as coins;
    // Total amount of sold jettons
    soldAmount: Int as coins;
    // Owner of the contract
    owner: Address;

    init(jettonWallet: Address, rate: Int) {
        self.jettonWallet = jettonWallet;
        self.rate = rate;

        self.amount = 0;
        self.soldAmount = 0;
        self.owner = sender();
    }

    // MARK: Receives

    receive("finish ico") {
        self.requireOwner();
        if self.amount > 0 {
            send( // send jettons
                SendParameters{
                    to: self.jettonWallet,
                    value: 0,
                    mode: SendRemainingValue + SendIgnoreErrors,
                    bounce: false,
                    body: TokenTransfer{
                        queryId: 0,
                        amount: self.amount,
                        destination: sender(),
                        response_destination: myAddress(),
                        custom_payload: null,
                        forward_ton_amount: ton("0.01"),
                        forward_payload: emptySlice()
                    }.toCell()
                }
            );
        }
        send( // send tons
            SendParameters{
                to: sender(),
                value: 0,
                mode: SendRemainingBalance + SendIgnoreErrors,
                body: "ico finished"
                    .asComment()
            }
        );
    }

    receive(msg: TokenNotification) {
        require(self.jettonWallet == sender(), "unknown jetton wallet");
        self.amount = self.amount + msg.amount;

        self.reply(
            self.stringAmount(self.amount)
            .asComment()
        );
    }

    // Buy jettons
    receive() {
        require(context().value > ton("0.1"), "amount is too small");
        let jettonAmount: Int = (context().value - ton("0.1")) * self.rate;
        require(jettonAmount > self.amount, "not enough jettons");
        self.amount = self.amount - jettonAmount;
        self.soldAmount = self.soldAmount + jettonAmount;
        send(
            SendParameters{
                to: self.jettonWallet,
                value: 0,
                mode: SendRemainingValue + SendIgnoreErrors,
                body: TokenTransfer{
                    queryId: 0,
                    amount: jettonAmount,
                    destination: sender(),
                    response_destination: myAddress(),
                    custom_payload: null,
                    forward_ton_amount: ton("0.01"),
                    forward_payload: emptySlice()
                }.toCell()
            }
        );
    }

    // MARK: Getters

    get fun balance(): Int {
        return myBalance();
    }

    get fun amount(): Int {
        return self.amount;
    }

    get fun soldAmount(): Int {
        return self.soldAmount;
    }

    get fun rate(): Int {
        return self.rate;
    }

    // MARK: Private Methods

    fun stringAmount(amount: Int): String {
        let sb: StringBuilder = beginString();
        sb.append("Total amount: ");
        sb.append(self.amount.toString());
        return sb.toString();
    }
}