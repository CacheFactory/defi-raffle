
import React from 'react';
import Web3 from 'web3';


import Raffle from '../built-contracts/Raffle.json';
import Navbar from './Navbar';
import Main from './Main';
import './App.css';

const CONTRACT_ADDRESS = '0xd6D15d2d887b5CEa1eF121B832e4596926b82405'

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
  const [account, setAccount] = React.useState('0x0');
  const [entries, setEntries] = React.useState([]);
  const [winners, setWinners] = React.useState([]);
  const [ethBalance, setEthBalance] = React.useState('0');
  const [loading, setLoading] = React.useState(true);
  const [poolTotal, setPoolTotal] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  const [nextRunDate, setNextRunDate] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      await loadWeb3();
      await handleLoadBlockchainData();
      await loadContractData();
    })();
  }, []);

  const blockchainUpdate = (error, sync) => {
    loadContractData()
  }

  const loadContractData = async () => {
    const raffle = new window.web3.eth.Contract(Raffle, CONTRACT_ADDRESS);

    const runNumber = await raffle.methods.runNumber().call()
    setPoolTotal(window.web3.utils.fromWei(await window.web3.eth.getBalance(CONTRACT_ADDRESS), 'Ether') )
    setNextRunDate(await raffle.methods.nextRunDate().call() )
    
    raffle.getPastEvents('NewWinner', { fromBlock: 0, toBlock: 'latest' }, async (error, eventResults) => {
      
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
      
      setWinners(eventResults)
    });
    
    raffle.getPastEvents('NewAddress', { fromBlock: 0, toBlock: 'latest', filter: {_runNumber: runNumber}, }, async (error, eventResults) => {
      
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
      
      setEntries(eventResults)
    });

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


  const addToPool = async (amountInWei) => {
    try {
      setPending(true)
      const web3 = window.web3;
      
      const raffle = new web3.eth.Contract(Raffle, CONTRACT_ADDRESS);
   
      const result = await raffle.methods.addAddress().send({value: amountInWei, from: account})
      setPending(false)
      
    } catch (error) {
      setPending(false)
      console.log('error.message => ', error.message);
    }
  };

  let content;
  if(loading) {
    content = <p id="loader" className="text-center">Loading...</p>;
  } else {
    content = (
      <Main
        etheriumBalance={ethBalance}
        entries={entries}
        addToPool={addToPool}
        poolTotal={poolTotal}
        pending={pending}
        winners={winners}
        nextRunDate={nextRunDate}
        account={account}
        />
    );
  }

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
            <div className="content mr-auto ml-auto">
              <a
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer">
              </a>
              {content}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
