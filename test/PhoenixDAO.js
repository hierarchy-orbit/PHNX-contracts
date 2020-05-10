const Web3 = require('web3') // 1.0.0-beta.34
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8555')

var BN = web3.utils.BN
var BigNumber = require('bignumber.js')
var PhoenixDaoToken = artifacts.require('./PhoenixDAO')

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
expect = chai.expect

contract('Phoenix DAO Token', function(accounts) {
  const owner = {
    public: accounts[0],
  }
  const user = {
    public: accounts[1],
  }

  var instance

  //////////////
  //  Basics  //
  //////////////

  it('PhoenixDAO deployed', async function() {
    instance = await PhoenixDaoToken.new({ from: owner.public })
    expect(instance).to.be.not.undefined
  })

  it('should have the name PhoenixDAO', async function() {
    let contractName = await instance.name()
    expect(contractName).to.be.equal('PhoenixDAO')
  })

  it('should have the decimals 18', async function() {
    let decimals = await instance.decimals()
    expect(decimals.toString()).to.be.equal('18')
  })

  it('should have the symbol PHNX', async function() {
    let contractSymbol = await instance.symbol()
    expect(contractSymbol).to.be.equal('PHNX')
  })

  it('should have the total supply of 110000000000000000000000000', async function() {
    let totalSupply = await instance.totalSupply()
    expect(totalSupply.toString()).to.be.equal('110000000000000000000000000')
  })

  it('owner should have all tokens', async function() {
    let ownerBalance = await instance.balanceOf(owner.public)
    expect(ownerBalance.toString()).to.be.equal('110000000000000000000000000')
  })

  it('other should have no tokens', async function() {
    let balance = await instance.balanceOf(user.public)
    expect(balance.toString()).to.be.equal('0')

    balance = await instance.balanceOf(accounts[4])
    expect(balance.toString()).to.be.equal('0')

    balance = await instance.balanceOf(instance.address)
    expect(balance.toString()).to.be.equal('0')
  })

  //////////////
  // Transfer //
  //////////////

  it('transfer tokens', async function() {
    let initialBalance = await instance.balanceOf(user.public)
    expect(initialBalance.toString()).to.be.equal('0')

    let success = await instance.transfer.call(user.public, 15, {
      from: owner.public,
    })
    expect(success).to.be.true
    await expect(
      instance.transfer(user.public, 15, { from: owner.public }),
    ).to.be.eventually.fulfilled

    let balance = await instance.balanceOf(user.public)
    expect(balance.toString()).to.be.equal('15')
  })

  it('fail to transfer tokens', async function() {
    await expect(
      instance.transfer(owner.public, 16, { from: user.public }),
    ).to.be.eventually.rejected
  })

  ///////////////////
  // Transfer From //
  ///////////////////

  it('transfer from tokens', async function() {
    let success = await instance.approve.call(user.public, 15, {
      from: owner.public,
    })
    expect(success).to.be.true
    await expect(
      instance.approve(user.public, 15, { from: owner.public }),
    ).to.be.eventually.fulfilled

    let initialBalance = await instance.balanceOf(user.public)
    expect(initialBalance.toString()).to.be.equal('15')

    let success2 = await instance.transferFrom.call(
      owner.public,
      user.public,
      15,
      { from: user.public },
    )
    expect(success2).to.be.true

    await expect(
      instance.transferFrom(owner.public, user.public, 15, {
        from: user.public,
      }),
    ).to.be.eventually.fulfilled

    let balance = await instance.balanceOf(user.public)
    expect(balance.toString()).to.be.equal('30')
})

  it('fail to transfer from tokens', async function() {
    await expect(
        instance.transferFrom(owner.public, user.public, 15, {
          from: user.public,
        }),
      ).to.be.eventually.rejected
  
})

  //////////
  // Burn //
  //////////

  it('burn tokens', async function() {
    await expect(instance.burn(15, { from: owner.public })).to.be.eventually.fulfilled
    await expect(instance.burn(15, { from: user.public })).to.be.eventually.rejected
  })

  it('Check getMoreTokens function', async function() {
    if(instance.getMoreTokens) {
      await expect(instance.getMoreTokens({ from: accounts[7] })).to.be.eventually.fulfilled
      let balance = await instance.balanceOf(accounts[7])
      let expectedBalance = new BigNumber(1).shiftedBy(18).times(10000)
      expect(balance.toString()).to.be.equal(expectedBalance.toFixed())
    } else {
      console.log()
      console.log('      Function getMoreTokens not implemented. Skipping...')

      return true
    }
  })

  //////////////
  // Raindrop //
  //////////////

  it('set PhoenixAuth address', async function() {
    await expect(instance.setPhoenixAuthAddress(user.public, { from: owner.public })).to.be.eventually.fulfilled
    await expect(instance.setPhoenixAuthAddress(accounts[5], { from: user.public })).to.be.eventually.rejected
    await expect(instance.setPhoenixAuthAddress(accounts[5], { from: accounts[7] })).to.be.eventually.rejected
    
  })
})
