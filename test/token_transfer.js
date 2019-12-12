const TokenZendR = artifacts.require('TokenZendR');

const should = require('chai')
    .use(require('chai-as-promised'))
    .should();

let sender;

contract('token_management', async (accounts) => {
    let token_name_bytes32 = web3.utils.asciiToHex('OPEN');
    let token_user_address = '0x98E42c6C6C21c046215d39CB411cec0b793E2C6d';
    beforeEach(async () => {
        sender = await TokenZendR.new();
        await sender.addNewToken(token_name_bytes32, token_user_address);
    });

    it('should add new supported token', async () => {
        let address = await sender.tokens.call(token_name_bytes32);

        address.should.equal(token_user_address);
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
