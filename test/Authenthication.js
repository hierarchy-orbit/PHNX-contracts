const Web3 = require('web3'); // 1.0.0-beta.34
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8555')

var BN = web3.utils.BN;
var PhoenixAuth = artifacts.require("./PhoenixAuth");
var PhoenixDAOToken = artifacts.require("./PhoenixDAO");

contract('Joined', function(accounts) {
    const owner = {
        public:  accounts[0],
    }
    const user = {
        public:  accounts[1],
    };

    var instancePhoenixAuth;
    var instancePhoenixDAO;

    //////////////
    //  Deploy  //
    //////////////

    it('PhoenixDAO deployed', async function () {
        instancePhoenixDAO = await PhoenixDAOToken.new({from: owner.public});
    });

    it('PhoenixAuth deployed', async function () {
        instancePhoenixAuth = await PhoenixAuth.new({from: owner.public});
    });

    it('set PhoenixAuth address', async function () {
        await instancePhoenixDAO.setPhoenixAuthAddress(instancePhoenixAuth.address, {from: owner.public});
    });

    it('set phoenix address', async function () {
        await instancePhoenixAuth.setPhoenixContractAddress(instancePhoenixDAO.address, {from: owner.public});
    });

    ////////////////
    //  PhoenixAuth  //
    ////////////////

    it('run through PhoenixAuth', async function () {
        await instancePhoenixAuth.whitelistAddress(user.public, true, 1, {from: owner.public});
        await instancePhoenixAuth.updatePhoenixMap(user.public, 5, 1, {from: owner.public});
        let amount = await instancePhoenixAuth.checkForValidChallenge(user.public, 1, {from: owner.public});
        assert.equal(amount, 5, 'The valid challenge was wrong');
        await instancePhoenixDAO.transfer(user.public, 100, {from: owner.public});
        await instancePhoenixDAO.authenticate(5, 1, 1, {from: user.public});
        let success = await instancePhoenixAuth.validateAuthentication(user.public, 1, 1, {from: owner.public});
        assert.equal(success, true, 'authentication failed');
    });

});