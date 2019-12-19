const TokenZendR = artifacts.require('TokenZendR');

const should = require('chai')
    .use(require('chai-as-promised'))
    .should();

let sender;
let token_name_bytes32 = web3.utils.asciiToHex('OPEN');
let token_bear_address = '0xee4fD5003990A51B847f2D398a1D251B6DC1cb53';
let token_cub_address = '0xfD5282C19906C2bDc83CAE70EFEf7725be2454b5';
let zero_address = '0x0000000000000000000000000000000000000000';

contract('token_management', async (accounts) => {
    beforeEach(async () => {
        sender = await TokenZendR.new();
        await sender.addNewToken(token_name_bytes32, token_bear_address);
    });

    it('should add new supported token', async () => {
        let address = await sender.tokens.call(token_name_bytes32);
        address.should.equal(token_bear_address);
    });

    it('should update supported token address', async () => {
        await sender.addNewToken(token_name_bytes32, token_cub_address);
        let address = await sender.tokens.call(token_name_bytes32);
        address.should.equal(token_cub_address);
    });

    it('should remove unused supported token address', async () => {
        await sender.removeToken(token_name_bytes32);
        let address = await sender.tokens.call(token_name_bytes32);
        address.should.equal(zero_address);
    });
});
// var token_transfer = artifacts.require("token_transfer");

// contract("token_transfer", function(_accounts) {
//   it("should assert true", function(done) {
//     token_transfer.deployed();
//     assert.isTrue(true);
//     done();
//   });
// });
