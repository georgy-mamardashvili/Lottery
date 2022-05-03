import { Component } from 'react';
import './App.css';
import web3 from './web3';
import LotteryContract from './lottery-contract';


class App extends Component {
  state = {
    manager: '',
  };

  async componentDidMount() {
    const manager = await LotteryContract.methods.manager().call();
    this.setState({ manager });
  }

  render() {
    web3.eth.getAccounts().then(console.log);
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by: {this.state.manager}</p>
      </div>
    );
  }
}

export default App;
