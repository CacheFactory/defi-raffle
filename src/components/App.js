
import React from 'react';
import Web3 from 'web3';
import _ from 'lodash';
import Raffle from '../built-contracts/Raffle.json';
import Navbar from './Navbar';
import Main from './Main';
import Pool from './Pool';
import './App.css';

let initialPoolId;

const CONTRACT_ADDRESS = '0x2737da347dB5CBd5318E6026c4c158f481b066Ef'

const loadWeb3 = async () => {
  try {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const networkId = await window.web3.eth.net.getId();

      if (networkId != 42) {
        alert('App only works on the Kovan test network')
      }

      
     
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  } catch (error) {
    console.log('[loadWeb3] error.message => ', error.message);
  }
};

const App = () => {
  const match = window.location.pathname.match(/([1-9].*)/ig)
  if (match) {
    initialPoolId = match[0]
  }

  const [account, setAccount] = React.useState('0x0');
  const [entries, setEntries] = React.useState([]);
  //const [winners, setWinners] = React.useState([]);
  const [ethBalance, setEthBalance] = React.useState('0');
  const [loading, setLoading] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  const [pendingNewPool, setPendingNewPool] = React.useState(false);
  const [nextRunDate, setNextRunDate] = React.useState(false);
  const [activePools, setActivePools] = React.useState([]);
  const [currentPool, setCurrentPool] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      await loadWeb3();

      if (initialPoolId) {
        loadPool(initialPoolId)
      }

      await handleLoadBlockchainData();
      await loadContractData();
    })();
  }, []);

  const blockchainUpdate = (error, sync) => {
    if(currentPool) {
      loadPool(currentPool.index)
    }
  }

  const loadContractData = async () => {
    const raffle = new window.web3.eth.Contract(Raffle, CONTRACT_ADDRESS);

    raffle.getPastEvents('NewPool', { fromBlock: 0, toBlock: 'latest' }, async (error, eventResults) => {
      
      if (error) {
        console.log('Error in NewAddress event handler: ' + error);
      }
      else {
        for(const event of eventResults) {
          event.timestamp = new Date(0)
          const timestamp = (await window.web3.eth.getBlock(event.blockNumber)).timestamp
          event.timestamp.setUTCSeconds(timestamp);
        }
      }
      
      setActivePools(eventResults);
    });
  }

  const loadPool = async (poolId) => {
    const raffle = new window.web3.eth.Contract(Raffle, CONTRACT_ADDRESS);
    const pool = await raffle.methods.pools(poolId).call()
    
    const results = await raffle.getPastEvents('NewAddress', { fromBlock: 0, toBlock: 'latest',  filter: {_poolIndex: poolId} })
     
    for(const event of results) {
      event.timestamp = new Date(0)
      const timestamp = (await window.web3.eth.getBlock(event.blockNumber)).timestamp
      event.timestamp.setUTCSeconds(timestamp);
    }
    pool.entries = results
    pool.index = poolId

    window.history.pushState({}, '', '/'+poolId);
    if (!pool.active) {
      await raffle.getPastEvents('NewWinner', { fromBlock: 0, toBlock: 'latest', filter: {_poolIndex: poolId} }, async (error, eventResults) => {
      
        if (error) {
          console.log('Error in NewAddress event handler: ' + error);
        }
        else {
          pool.winner = eventResults
        }
        
      });
    }
    

    setCurrentPool(pool)

  }

  const handleLoadBlockchainData = async () => {
    try {
      const web3 = window.web3;

      const accounts = await web3.eth.getAccounts();
      const firstAccount = accounts[0];
      setAccount(firstAccount);

      const ethBalance = await web3.eth.getBalance(firstAccount)
      setEthBalance(ethBalance)
      

      web3.eth.subscribe('newBlockHeaders', blockchainUpdate);
      
    } catch (error) {
      console.log('[handleLoadBlockchainData] error.message => ', error.message);
    } finally {
      setLoading(false);
    }
  };


  const addToPool = async (amountInWei, poolIndex) => {
    try {
      setPending(true)
      const web3 = window.web3;
      
      const raffle = new web3.eth.Contract(Raffle, CONTRACT_ADDRESS);
   
      const result = await raffle.methods.addAddress(poolIndex).send({value: amountInWei, from: account})
      setPending(false)
      loadPool(currentPool.index)
      
    } catch (error) {
      setPending(false)
      console.log('error.message => ', error.message);
    }
  };

  const runPool = async (poolIndex) => {
    try {
      const web3 = window.web3;
      
      const raffle = new web3.eth.Contract(Raffle, CONTRACT_ADDRESS);

      const result = await raffle.methods.runEntries( ( Math.floor(Math.random() * 10000)), poolIndex).send({from: account})
      
    } catch (error) {
      console.log('error.message => ', error.message);
    }
  }

  const createNewPool = async (nextRunDate, ownerPercentFee, title) => {
    try {
      setPendingNewPool(true)
      const date = new Date(nextRunDate)
      const web3 = window.web3;
      
      const raffle = new web3.eth.Contract(Raffle, CONTRACT_ADDRESS);
      
      const result = await raffle.methods.addPool(date.getTime()/1000, ownerPercentFee, web3.utils.fromAscii(title)).send({ from: account})
      setPendingNewPool(false)
      await loadContractData();
      
    } catch (error) {
      setPendingNewPool(false)
      console.log('error.message => ', error.message);
    }
  };

  const closeModal = () => {
    window.history.pushState({}, '', '/');
    setCurrentPool(null)
  }

  let content;
  if(loading) {
    content = <p id="loader" className="text-center">Loading...</p>;
  } else {
    content = (
      <Main
        etheriumBalance={ethBalance}
        entries={entries}
        addToPool={addToPool}
        nextRunDate={nextRunDate}
        account={account}
        createNewPool={createNewPool}
        activePools={_.reverse(activePools)}
        loadPool={loadPool}
        pendingNewPool={pendingNewPool}
        />
    );
  }

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
      {
        currentPool && 

        <div id="exampleModalCenter" className="modal fade show" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" style={{display:'block', backgroundColor: 'rgba(0,0,100,0.6)'}}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalCenterTitle">{window.web3.utils.hexToAscii(currentPool.title)}</h5>
              <button type="button" className="close" onClick={closeModal} aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Pool 
                addToPool={addToPool}
                pool={currentPool}
                pending={pending}
                runPool={runPool}
                account={account}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal} data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      }
      </div>
    </div>
  );
};

export default App;
