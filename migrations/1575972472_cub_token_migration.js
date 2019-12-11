let CubToken = artifacts.require('CubToken');

module.exports = function(_deployer) {
  _deployer.deploy(CubToken);
};
