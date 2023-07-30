message ChangeJettonWallet {
    address: Address;
}

// MARK: TEP64 Standard: Jetton Messages
message(0xf8a7ea5) TokenTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address; // not jetton wallet
    response_destination: Address;
    custom_payload: Cell?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining;
}

message(0x7362d09c) TokenNotification {
    queryId: Int as uint64;              
    amount: Int as coins;
    from: Address; // not jetton wallet
    forward_payload: Slice as remaining; // Comment Text message when Transfer the jetton 
}