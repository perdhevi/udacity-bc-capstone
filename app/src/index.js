import Web3 from "web3";
import metaSupplyChain from "../../eth-contracts/build/contracts/SolnSquareVerifier.json";
import './style.css';
var proof = require('./proof.json');


const App = {
  web3: null,
  account:null,
  meta:null,
  gasLimit : 6700000, 

  contracts: {},
  emptyAddress: "0x0000000000000000000000000000000000000000",
  metamaskAccountID: "0x0000000000000000000000000000000000000000",
  init: async function () {
    //  App.readForm();
    /// Setup access to blockchain
    return await App.initWeb3();
  },

  initWeb3: async function () {
    /// Find or Inject Web3 Provider
    /// Modern dapp browsers...
    if (window.ethereum) {
        App.web3 = window.ethereum;
        try {
            // Request account access
            await window.ethereum.enable();
            console.log("using default metamask")
        } catch (error) {
            // User denied account access...
            console.error("User denied account access")
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        console.log('legacy Dapp');
        App.web3 = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
        App.web3 = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    App.getMetaskAccountID();

    return App.initApp();
  },

  getMetaskAccountID: function () {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts

    // Retrieving accounts
    web3.eth.getAccounts(function(err, res) {
        if (err) {
            console.log('Error:',err);
            return;
        }
        console.log('getMetaskID:',res);
        App.metamaskAccountID = res[0];

    })
  },

  initApp: async function () {
    console.log('Initialize app parameter');

    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    const deployedNetwork = metaSupplyChain.networks[networkId];
    this.meta = new web3.eth.Contract(
    metaSupplyChain.abi,
    deployedNetwork.address,
    );
    // get accounts
    const accounts = await web3.eth.getAccounts();
    console.log("accounts in metamask", accounts);
    App.fetchEvents();

    return App.bindEvents();
},



  bindEvents: function() {
    $(document).on('click', App.handleButtonClick);
},

handleButtonClick: async function(event) {
    event.preventDefault();

    App.getMetaskAccountID();

    var processId = parseInt($(event.target).data('id'));
    console.log('processId',processId);

    switch(processId) {
        case 1:
            return await App.minting(event);
            break;
        case 2:
            return await App.checkTokenURI(event);
            break;
        }
  },

  minting: async function(event){
    event.preventDefault();
    let tokenId = $('#tokenID').val();
    this.meta.methods.addSolution(App.metamaskAccountID, tokenId,  proof.proof.a, proof.proof.b, proof.proof.c, proof.inputs)
      .send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result){
        
        let keyId = result.events.SolutionAdded.returnValues[0];
        console.log("keyId:",keyId);
        App.meta.methods.mint(App.metamaskAccountID, tokenId, keyId).send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result){
          console.log(result);
        })
        
      });
  },

  checkTokenURI: async function(event){
    event.preventDefault();
    let tokenId = $('#tokenID').val();
    this.meta.methods.tokenURI(tokenId).call({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result){
      console.log(result);
    })
  },

  fetchEvents: function () {
    this.meta.events.allEvents({},function(err, log) {
      if (!err)
        $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
    });
    
}



};

$(function () {
  $(window).load(function () {
      App.init();
  });
});
