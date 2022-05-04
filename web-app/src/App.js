import { Component } from 'react';
import './App.css';
import web3 from './web3';
import LotteryContract from './lottery-contract';


class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
  };

  async componentDidMount() {
    const manager = await LotteryContract.methods.manager().call();
    const players = await LotteryContract.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(LotteryContract.options.address);

    this.setState({ manager, players, balance });
  }

  onEnter = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success...' });
    console.log('value: ', this.state.value);
    await LotteryContract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether'),
    });

    this.setState({ message: 'You have been entered!' });
  }

  pickWinner = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success...' });
    
    await LotteryContract.methods.pickWinner().send({
      from: accounts[0],
    });

    this.setState({ message: 'A winner has been picked!' });
  }

  render() {
    web3.eth.getAccounts().then(console.log);
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
            This contract is managed by: {this.state.manager}
        </p>
        <p>
            There are currently {this.state.players.length} people entered,
            competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>
        <hr/>
        <form onSubmit={this.onEnter}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter? </label>
            <input
              type='number'
              value={this.state.value}
              onChange={event => {
                console.log('target', event.target.value);
                this.setState({ value: event.target.value });
                console.log();
              }}
              />
          </div>
          <button>Enter</button>
        </form>
        <hr/>
        <div>
          <h1>Ready to pick a winner?</h1>
          <button onClick={this.pickWinner}>Pick a winner!</button>
        </div>
        <hr/>
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
