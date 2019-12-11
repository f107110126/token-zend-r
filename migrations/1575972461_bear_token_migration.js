let BearToken = artifacts.require('BearToken');

module.exports = function(_deployer) {
  _deployer.deploy(BearToken);
};
