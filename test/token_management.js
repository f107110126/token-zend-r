const TokenZendR = artifacts.require('TokenZendR');

let sender;
let token_name_bytes32 = web3.utils.asciiToHex('BEAR');
let token_address_1 = '0x5a19000aCeAD1B22795675d506BB3715f5bcD9F3';
let token_address_2 = '0xBf773B4d4c056f5524B2A6d06e29F0A45874320A';
// token address 1 and 2 are both valid address,
// but not really point to any token contract.
let zero_address = '0x0000000000000000000000000000000000000000';

contract('token_management', _accounts => {
    beforeEach(async () => {
        sender = await TokenZendR.deployed();
        await sender.addNewToken(token_name_bytes32, token_address_1);
    });

    it('should add new supported token', async () => {
        let address = await sender.tokens.call(token_name_bytes32);
        assert.equal(address, token_address_1, 'now address should equal to address_1.');
    });

    it('should update supported token', async () => {
        await sender.addNewToken(token_name_bytes32, token_address_2);
        let address = await sender.tokens.call(token_name_bytes32);
        assert.equal(address, token_address_2, 'now address should equal to address_2.');
    });

    it('should remove unused supported token address', async () => {
        await sender.removeToken(token_name_bytes32);
        let address = await sender.tokens.call(token_name_bytes32);
        assert.equal(address, zero_address, 'now address should equl zero address.');
    });
});