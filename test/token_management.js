const TokenZendR = artifacts.require('TokenZendR');
const BearToken = artifacts.require('BearToken');
const CubToken = artifacts.require('CubToken');

let sender, bear, cub;
let BearName = web3.utils.asciiToHex('BEAR');
let CubName = web3.utils.asciiToHex('CUB');

contract('token_management', _accounts => {
    let accountA, accountB, accountC, accountD;
    [accountA, accountB, accountC, accountD] = _accounts;
    beforeEach(async () => {
        sender = await TokenZendR.deployed();
        bear = await BearToken.deployed();
        cub = await CubToken.deployed();

        await sender.addNewToken(BearName, bear.address);
        await sender.addNewToken(CubName, cub.address);
    });

    it('should be able to transfer sender token to another wallet.', async () => {
        // When transfering token, multiple by figure of decimal to get exact token
        // e.g to send 5 Bear = 5e5, where 5 is the decimal places.
        let amount = web3.utils.toBN(500000e5);

        // Account a approve contract to spend on behalf
        await bear.approve(sender.address, amount, { from: accountA });

        await sender.transferTokens(BearName, accountB, amount, {from: accountA});

        let balance = ((await bear.balanceOf(accountB)).toString());

        assert.equal(balance, amount.toString(), 'Balance of accountB should equal to 500000e5.');
    });
});