

const App = {

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
            //return await App.harvestItem(event);
            break;
        }
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
