const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');
 
provider = new HDWalletProvider(
  'YOUR_MNEMONIC',
  'YOUR_INFURA_URL'
);
 
const web3 = new Web3(provider);
 
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy contract from account: ' + accounts[0]); 
  const results = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });

  
  console.log('Contract interface: ' + JSON.stringify(abi));
  console.log('Contract deployed to: ' + results.options.address);
  provider.engine.stop();
};

try {
  deploy();
} catch(e) {
  console.log('error');
}
