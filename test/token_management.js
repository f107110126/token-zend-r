const TokenZendR = artifacts.require('TokenZendR.sol');
const BearToken = artifacts.require('BearToken.sol');
const CubToken = artifacts.require('CubToken.sol');

const BigNumber = web3.utils.BN;

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

let sender, bear, cub;
let BearName = web3.utils.asciiToHex('BEAR');
let CubName = web3.utils.asciiToHex('CUB');

contract('token_management', async (accounts) => {
    let accountA, accountB, accountC, accountD;
    [accountA, accountB, accountC, accountD] = accounts;
    beforeEach(async () => {
        sender = await TokenZendR.new();
        bear = await BearToken.new();
        cub = await CubToken.new();

        await sender.addNewToken(BearName, bear.address);
        await sender.addNewToken(CubName, cub.address);
    });

    it('should be able to transfer sender token to another wallet.', async () => {
        // When transfering token, multiple by figure of decimal to get exact token
        // e.g to send 5 Bear = 5e5, where 5 is the decimal places.
        let amount = new BigNumber(500000e5);

        // Account a approve contract to spend on behalf
        await bear.approve(sender.address, amount, { from: accountA });

        await sender.transferTokens(BearName, accountB, amount, {from: accountA});

        let balance = ((await bear.balanceOf(accountB)).toString());

        balance.should.equal(amount.toString());
    });
});

// var token_management = artifacts.require("token_management");

// contract("token_management", function(_accounts) {
//   it("should assert true", function(done) {
//     token_management.deployed();
//     assert.isTrue(true);
//     done();
//   });
// });
