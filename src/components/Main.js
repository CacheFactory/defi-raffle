
import React from 'react';
import _ from 'lodash';
import ethLogo from '../eth-logo.png';

const Main = ({
  etheriumBalance,
  addToPool,
  entries,
  poolTotal,
  pending,
  winners,
  nextRunDate,
  account
}) => {
  const inputRef = React.useRef(null);

  const handleSubmit = event => {
    event.preventDefault();
    let amount = inputRef.current.value.toString();
    amount = window.web3.utils.toWei(amount, 'Ether');
    addToPool(amount)
  };

  const d = new Date(0)
  d.setUTCSeconds(nextRunDate);


  const now = new Date().getTime();

  // Find the distance between now and the count down date
  const distance = d - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return (
    <div
      id="content"
      className="mt-3">
      <table className="table table-borderless text-muted text-center">
        <thead>
          <tr>
            <th scope="col">Wallet Ethereum balance</th>

          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{window.web3.utils.fromWei(etheriumBalance, 'Ether')} ETH</td>

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
              disabled={pending}
              className="btn btn-primary btn-block btn-lg">
              {pending ? 'Pending transaction' : 'Join Pool'}
            </button>
          </form>
          <h1 style={{ textAlign: 'center' }}>Active Pool Total</h1>
          <h2 style={{ textAlign: 'center' }}>{poolTotal} ETH</h2>
          <hr />
          <h1 style={{ textAlign: 'center' }}>Next drawing</h1>
          <h2 style={{ textAlign: 'center' }}>{days}d {hours}h {minutes}m</h2>



          <h3>Active Entries</h3>
          <table className="table table-borderless " style={{ fontSize: 10 }}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Address</th>
                <th scope="col">Value</th>
                <th scope="col" >Winning Chance</th>
              </tr>
            </thead>
            <tbody>

              {_.reverse(entries).map((entry, i) => {
                return <tr><th scope="row">{i + 1}</th><td>
                  <div className='truncate' title={entry.returnValues._from}> {entry.returnValues._from == account ? 'You' : entry.returnValues._from} </div>
                </td> <td>{window.web3.utils.fromWei(entry.returnValues._value, 'Ether')} ETH</td> <td>{(window.web3.utils.fromWei(entry.returnValues._value, 'Ether') / poolTotal * 100).toFixed(2)}% </td> </tr>
              })}


            </tbody>
          </table>

          <h3>Past winners</h3>
          <table className="table table-borderless " style={{ fontSize: 10 }}>
            <thead>
              <tr>
                <th >Address</th>
                <th >Value</th>
                <th >Date</th>
              </tr>
            </thead>
            <tbody>

              {_.filter(winners).map((entry) => {

                //const blockData = await window.web3.eth.getBlock(entry.blockNumber)
                return <tr><td> <div title={entry.returnValues._from} className='truncate'> {entry.returnValues._from == account ? 'You' : entry.returnValues._from} </div> </td> <td > {window.web3.utils.fromWei(entry.returnValues._value, 'Ether')} ETH</td><td> {entry.timestamp.toDateString()} </td></tr>
              })}


            </tbody>
          </table>



        </div>
      </div>
    </div>
  );
};

export default Main;
