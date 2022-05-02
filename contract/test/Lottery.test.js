const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { abi, evm } = require('../compile');

const web3 = new Web3(ganache.provider());
 
let accounts = [];
let admin;
let lottery;
 
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  admin = accounts[0];

  lottery = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
    })
    .send({ from: admin, gas: '1000000' });
});
 
describe('Lottery Contract', async () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async () => {
    let newPlayer = accounts[1];
    let entryEtherValue = web3.utils.toWei('0.02','ether');

    await lottery.methods.enter().send({
      from: newPlayer,
      value: entryEtherValue,
    });

    const players = await lottery.methods.getPlayers().call({
      from: admin,
    });
    const balance = await lottery.methods.getBalance().call({
      from: admin,
    });

    assert.equal(players[0], newPlayer);
    assert.equal(balance, entryEtherValue);
  });

  it('allows multiple accounts to enter', async () => {
    let newPlayer1 = accounts[1];
    let newPlayer2 = accounts[2];
    let entryEtherValue = web3.utils.toWei('0.02','ether');

    await lottery.methods.enter().send({
      from: newPlayer1,
      value: entryEtherValue,
    });

    await lottery.methods.enter().send({
      from: newPlayer2,
      value: entryEtherValue,
    });

    const players = await lottery.methods.getPlayers().call({
      from: admin,
    });
    const balance = await lottery.methods.getBalance().call({
      from: admin,
    });

    assert.equal(players[0], newPlayer1);
    assert.equal(players[1], newPlayer2);

    assert.equal(balance, entryEtherValue*2);
  });

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0,
      });
      assert(false);
    } catch(err) {
      assert.ok(err);
    };
  });

  it('only manager can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch(err) {
      assert.ok(err);
    };
  });

  it('sends money to a winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('2','ether'),
    });

    const initialBalance = await web3.eth.getBalance(accounts[1]);

    await lottery.methods.pickWinner().send({ from: accounts[0] });

    const finalBalance = await web3.eth.getBalance(accounts[1]);

    const difference = finalBalance - initialBalance;
    console.log(difference);
    assert (difference > web3.utils.toWei('1.9', 'ether'));
  });
});