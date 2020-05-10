const Web3 = require('web3'); // 1.0.0-beta.34
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8555')

var BN = web3.utils.BN;
var PhoenixAuth = artifacts.require("./PhoenixAuth");

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
expect = chai.expect

contract('PhoenixAuth', function(accounts) {
    const owner = {
        public:  accounts[0],
    }
    const user = {
        public:  accounts[1],
    };

    var instance;

    //////////////
    //  Basics  //
    //////////////

    it('PhoenixAuth deployed', async function () {
        instance = await PhoenixAuth.new({from: owner.public});
        expect(instance).to.be.not.undefined
    });

    /////////////////
    //  Whitelist  //
    /////////////////

    it('whitelist address', async function () {
        let status = await instance.whitelist.call(1,user.public)
        expect(status).to.be.false
        await expect(instance.whitelistAddress(user.public, true, 1, {from: owner.public})).to.be.eventually.fulfilled
        status = await instance.whitelist.call(1,user.public)
        expect(status).to.be.true
        
    });
    it('Check if non-owner can not add whitelist', async function () {
        let status = await instance.whitelist.call(2,user.public)
        expect(status).to.be.false
        await expect(instance.whitelistAddress(user.public, true, 2, {from: user.public})).to.be.eventually.rejected
        status = await instance.whitelist.call(2,user.public)
        expect(status).to.be.false

        status = await instance.whitelist.call(1,user.public)
        expect(status).to.be.true
    });


    it('Check if non-owner can not set phoenixcontract address', async function () {

        await expect(instance.setPhoenixContractAddress(accounts[3],{from: user.public})).to.be.eventually.rejected
        await expect(instance.setPhoenixContractAddress(accounts[3],{from: owner.public})).to.be.eventually.fulfilled
        let phoenixDAOContract = await instance.phoenixDAOContract.call()
        expect(phoenixDAOContract).to.be.equal(accounts[3])

    });

    
    /////////////////
    //  Phoenix Map  //
    /////////////////
    
    it('update Phoenix map', async function () {

        let amount = await instance.checkForValidChallenge(user.public, 1, {from: owner.public});
        assert.equal(amount, 1, 'The default challenge was wrong');
        await expect(instance.updatePhoenixMap(user.public, 5, 1, {from: user.public})).to.be.eventually.rejected
        await expect(instance.updatePhoenixMap(user.public, 5, 1, {from: owner.public})).to.be.eventually.fulfilled
        amount = await instance.checkForValidChallenge(user.public, 1, {from: owner.public});
        assert.equal(amount, 5, 'The valid challenge was wrong');
    })
    
    it('fail to update phoenix map not owner address', async function () {
        await expect(instance.updatePhoenixMap(user.public, 5, 1, {from: user.public})).to.be.eventually.rejected
    });
    
    /////////////////
    //  Challenge  //
    /////////////////
    
    it('fail to get a valid challenge', async function () {
        let amount = await instance.checkForValidChallenge(owner.public, 1, {from: accounts[4]});
        assert.equal(amount, 1, 'The valid challenge check was incorrect');
    })
    
    //////////////////////
    //  Authentication  //
    //////////////////////
    
    it('check for valid authentication false', async function () {
        let success = await instance.validateAuthentication.call(user.public, 1, 1, {from: owner.public});
        assert.equal(success, false, 'Authentication succeeded where it should have failed');
    })

    it('authenthicate user', async function () {
        await expect(instance.authenticate(user.public,5,1,1,{from:accounts[3]})).to.be.eventually.fulfilled
        let success = await instance.validateAuthentication.call(user.public, 1, 1, {from: owner.public});
        assert.equal(success, true, 'Authentication failed where it should have succeeded');
    })

});