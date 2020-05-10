var PhoenixDAO = artifacts.require("PhoenixDAO");
var PhoenixAuth = artifacts.require("PhoenixAuth");

module.exports = function(deployer) {
    deployer.deploy(PhoenixDAO);
    deployer.deploy(PhoenixAuth);
};