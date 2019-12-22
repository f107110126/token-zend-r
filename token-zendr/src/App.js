import React, { Component } from 'react';
import Web3 from 'web3';
import Tokens from './Tokens/all';
import Nav from './Components/Nav';
import UnlockMetamask from './Components/UnlockMetamask';
import InstallMetamask from './Components/InstallMetamask';
import Container from './Components/Container';
import Description from './Components/Description';
import TokenZendR from './contracts/TokenZendR';
import TruffleContract from 'truffle-contract';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.tokens = Tokens;
    this.appName = 'TokenZendR';
    this.isWeb3 = true;
    this.isWeb3Locked = false;
    this.newTransfer = this.newTransfer.bind(this);
    this.closeTransfer = this.closeTransfer.bind(this);
    this.onInputChangeUpdateField = this.onInputChangeUpdateField.bind(this);

    this.state = {
      tzAddress: null,
      inProgress: false,
      tx: null,
      network: {
        networkId: 'Checking...',
        networkName: 'Checking...'
      },
      account: null,
      tokens: [],
      transferDetail: {},
      fields: {
        receiver: null,
        amount: null,
        gasPrice: null,
        gasLimit: null
      },
      defaultGasPrice: null,
      defaultGasLimit: 200000
    };

    let web3 = window.web3;

    if (typeof web3 !== 'undefined') {
      // use Mist/MetaMask's provider
      this.web3Provider = web3.currentProvider;
      this.web3 = new Web3(web3.currentProvider);

      this.tokenZendr = TruffleContract(TokenZendR);
      this.tokenZendr.setProvider(this.web3Provider);
    } else {
      this.isWeb3 = false;
    }
  };

  setNetwork = async () => {
    let networkName, that = this;

    let networkId = await this.web3.eth.net.getId();
    switch (networkId) {
      case '1':
        networkName = 'Main';
        break;
      case '2':
        networkName = 'Morden';
        break;
      case '3':
        networkName = 'Ropsten';
        break;
      case '4':
        networkName = 'Rinkeby';
        break;
      case '5':
        networkName = 'Kovan';
        break;
      default:
        networkName = networkId;
    }
    that.setState({
      network: { networkId, networkName }
    });
    return;
  };

  newTransfer = (index) => {
    this.setState({
      transferDetail: this.state.tokens[index]
    });
  };

  closeTransfer = () => {
    this.setState({
      transferDetail: {},
      fields: {}
    });
  };

  setGasPrice = async () => {
    let gasPrice = await this.web3.eth.getGasPrice();
    gasPrice = this.web3.utils.fromWei(gasPrice, 'gwei');
    this.setState({ defaultGasPrice: Number(gasPrice) });
  };

  setContractAddress = async () => {
    let contract = await this.tokenZendr.deployed();
    this.setState({ tzAddress: contract.address });
  };

  resetApp = () => {
    this.setState({
      transferDetail: {},
      fields: {
        receiver: null,
        amount: null,
        gasPrice: null,
        gasLimit: null
      },
      defaultGasPrice: null
    });
  };

  Transfer = async () => {
    this.setState({
      inProgress: true
    });

    let contract = new this.web3.eth.Contract(
      this.state.transferDetail.abi,
      this.state.transferDetail.address
    );

    let transObj = {
      from: this.state.account,
      gas: this.state.defaultGasLimit,
      gasPrice: this.state.defaultGasPrice
    };

    let app = this;
    let amount = this.state.fields.amount + '.e+' + this.state.transferDetail.decimal;
    let symbol = this.web3.utils.asciiToHex(this.state.transferDetail.symbol);
    let receiver = this.state.fields.receiver;
    let zero_address = '0x0000000000000000000000000000000000000000';

    amount = Number(amount); // scientific notation --> Number

    amount = this.web3.utils.toBN(amount).toNumber(); // Number --> BigNumber

    let approve = await contract.methods.approve(this.state.tzAddress, amount).send(transObj);
    console.log('approve: ', approve);
    this.tokenZendrInstance = await app.tokenZendr.deployed();
    let symbol_address = await this.tokenZendrInstance.tokens.call(symbol);
    if (symbol_address === zero_address) {
      await this.tokenZendrInstance.addNewToken(symbol, contract._address, transObj);
    } else {
      console.log('no token need to be added.');
    }
    this.watchEvents();

    this.tokenZendrInstance.transferTokens(symbol, receiver, amount, transObj)
      .then((response, err) => {
        if (response) {
          console.log(response);
          app.resetApp();
          app.setState({
            tx: response.tx,
            inProgress: false
          });
        } else {
          console.log(err);
        }
      });
  };

  /**
   * @dev Just a console log to list all transfers
   */
  watchEvents = () => {
    let param = {
      from: this.state.account,
      to: this.state.fields.receiver,
      amount: this.state.fields.amount
    };

    console.log(this.tokenZendrInstance);

    this.tokenZendrInstance.allEvents((error, response) => console.log('watch event: ', { error, response }));

    this.tokenZendrInstance.TransferSuccessful({
      filter: param,
      fromBlock: 0,
      toBlock: 'latest'
    }, (error, event) => {
      console.log(event);
    });
  };

  onInputChangeUpdateField = (name, value) => {
    let fields = this.state.fields;
    fields[name] = value;
    this.setState({ fields });
  };

  setupTokens = () => {
    let app = this;
    Tokens.forEach(async (token) => {
      let account = app.state.account;
      // let contract = this.web3.eth.contract(token.abi);
      // let erc20Token = contract.at(token.address);
      let contract = TruffleContract(token);
      contract.setProvider(app.web3Provider);
      let erc20Token = await contract.deployed();

      let address, name, symbol, icon, decimal, balance, abi;
      address = erc20Token.address;
      name = await erc20Token.name();
      symbol = await erc20Token.symbol();
      decimal = app.web3.utils.BN(await erc20Token.decimals()).toNumber();
      icon = token.icon;
      abi = token.abi;
      let precision = '1e' + decimal;
      balance = app.web3.utils.BN(await erc20Token.balanceOf(account)).toNumber() / precision;

      let tokens = app.state.tokens;
      if (balance > 0) tokens.push({ decimal, balance, name, symbol, icon, abi, address });
      app.setState({ tokens });
    });
  }

  componentDidMount = async () => {
    let account = await this.web3.eth.getCoinbase();
    await this.setNetwork();
    await this.setGasPrice();
    await this.setContractAddress();
    this.setState({ account });
    this.setupTokens();
  }

  render() {
    if (this.isWeb3) {
      if (this.isWeb3Locked) {
        return (
          <div>
            <Nav appName={this.appName} network={this.state.network.networkName} />
            <UnlockMetamask message='Unlock Your Metamask/Mist Wallet.' />
          </div>
        );
      } else {
        return (
          <div>
            <Nav appName={this.appName} network={this.state.network.networkName} />
            <Description />
            <Container onInputChangeUpdateField={this.onInputChangeUpdateField}
              transferDetail={this.state.transferDetail}
              closeTransfer={this.closeTransfer}
              newTransfer={this.newTransfer}
              Transfer={this.Transfer}
              account={this.state.account}
              defaultGasPrice={this.state.defaultGasPrice}
              defaultGasLimit={this.state.defaultGasLimit}
              tx={this.state.tx}
              inProgress={this.state.inProgress}
              fields={this.state.fields}
              tokens={this.state.tokens} />
          </div>
        );
      }
    } else {
      return (
        <InstallMetamask />
      );
    }
  }
}

export default App;
