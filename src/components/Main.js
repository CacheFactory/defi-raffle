
import React from 'react';

import ethLogo from '../eth-logo.png';

const Main = ({
  etheriumBalance,
  addToPool,
  entries
}) => {
  const inputRef = React.useRef(null);

  const handleSubmit = event => {
    event.preventDefault();


    let amount = inputRef.current.value.toString();
    amount = window.web3.utils.toWei(amount, 'Ether');
    addToPool(amount)
  };
  
  const poolTotal = entries.reduce(( total, entry) => {
    return parseFloat(window.web3.utils.fromWei(entry.returnValues._value, 'Ether')) + total
  }, 0) 

  return (
    <div
      id="content"
      className="mt-3">
      <table className="table table-borderless text-muted text-center">
        <thead>
          <tr>
            <th scope="col">Ethereum balance</th>
            
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{window.web3.utils.fromWei(etheriumBalance, 'Ether')} Eth</td>
            
          </tr>
        </tbody>
      </table>
      <div className="card mb-4" >
        <div className="card-body">
          <form
            className="mb-3"
            onSubmit={handleSubmit}>
            
            <div className="input-group mb-4">
              <input
                type="text"
                ref={inputRef}
                className="form-control form-control-lg"
                placeholder="0"
                required />
              <div className="input-group-append">
                <div className="input-group-text">
                  <img
                    src={ethLogo}
                    height="32"
                    alt="" />
                  &nbsp;&nbsp;&nbsp; ETH
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg">
              Join Pool
            </button>
          </form>
          <h3>Pool total {poolTotal} ETH</h3>
          <h3>Entries</h3>
        <table className="table table-borderless " style={{fontSize: 10}}>
        <thead>
          <tr>
            <th >Address</th>
            <th >Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
          { entries.map((entry) => {
            return <tr><td>{entry.returnValues._from}</td> <td>{window.web3.utils.fromWei(entry.returnValues._value, 'Ether')} ETH</td></tr>
          }) }
            
          </tr>
        </tbody>
      </table>

          
        </div>
      </div>
    </div>
  );
};

export default Main;
