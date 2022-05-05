import { Component } from 'react';
import './App.css';
import web3 from './web3';
import LotteryContract from './lottery-contract';


class App extends Component {
  state = {
    manager: '',
    currentUser: '',
    players: [],
    balance: '',
    value: '',
    message: '',
  };

  async componentDidMount() {
    const manager = await LotteryContract.methods.manager().call();
    const accounts = await web3.eth.getAccounts();
    const currentUser = accounts[0];
    const message = `Let's play a lottery!`;

    this.setState({ manager, currentUser, message });

    await this.updateLotteryStatistics();
  }

  async updateLotteryStatistics() {
    const players = await LotteryContract.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(LotteryContract.options.address);
    this.setState({ players, balance });
  }

  onEnter = async (event) => {
    event.preventDefault();
    this.setState({ message: 'Waiting on transaction success...' });

    try {
      await LotteryContract.methods.enter().send({
        from: this.state.currentUser,
        value: web3.utils.toWei(this.state.value, 'ether'),
      });
      this.setState({ message: 'You have been entered!' });
    } catch(e) {
      this.setState({ message: 'An error occur!' });
      console.log(e);
    }
    this.updateLotteryStatistics();
  }

  pickWinner = async () => {
    this.setState({ message: 'Waiting on transaction success...' });
    
    try {
      await LotteryContract.methods.pickWinner().send({
        from: this.state.currentUser,
      });
      const lastWinner = await LotteryContract.methods.getLastWinner().call();
      this.setState({ message: `A winner has been picked: ${lastWinner}` });
    } catch(e) {
      this.setState({ message: 'An error occur!' });
      console.log(e);
    }

    this.updateLotteryStatistics();
  }

  render() {
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
          <h4>Hey, {this.state.currentUser}! Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter? </label>
            <input
              type='number'
              min='0.02'
              max='1'
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
              />
          </div>
          <button>Enter</button>
        </form>
        {this.state.manager === this.state.currentUser &&
        <div>
          <hr/>
          <h4>Ready to pick a winner?</h4>
          <button onClick={this.pickWinner}>Pick a winner!</button>
        </div>}
        <hr/>
        <h2 style={{textAlign: 'center'}} >{this.state.message}</h2>
      </div>
    );
  }
}

export default App;
