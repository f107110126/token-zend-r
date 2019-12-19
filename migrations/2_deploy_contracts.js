const TokenZendR = artifacts.require('TokenZendR');
const BearToken = artifacts.require('BearToken');
const CubToken = artifacts.require('CubToken');

module.exports = function(deployer) {
    deployer.deploy(TokenZendR);
    deployer.deploy(BearToken);
    deployer.deploy(CubToken);
};