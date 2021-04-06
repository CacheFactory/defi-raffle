import React from 'react';
import _ from 'lodash';
import ethLogo from '../eth-logo.png';

const Pool = ({
  addToPool,
  pool,
  pending,
  runPool,
  account
}) => {
  const now = new Date()
  const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
  const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch)

  const diableRunPoolButton = parseInt(pool.nextRunDate) >= utcSecondsSinceEpoch

  const minRunAt = new Date(0)
  minRunAt.setUTCSeconds(pool.nextRunDate / 1000);

  const inputRef = React.useRef(null);
  console.log(pool)
  const handleSubmit = event => {
    event.preventDefault();


    let amount = inputRef.current.value.toString();
    amount = window.web3.utils.toWei(amount, 'Ether');
    addToPool(amount, pool.index)
  };

  
  return (
    <div
      id="content"
      className="mt-3">

      {
        !pool.active &&
        <div className="card mb-4" >
          <div className="card-body">
            <h1>Pool ran</h1>
            <h4>Winner</h4>
            <p>{pool.winningAddress}</p>

            <h4>Amount</h4>
            <p>{window.web3.utils.fromWei(_.get(pool, 'winner[0].returnValues._value', '0'), 'Ether')} ETH</p>

          </div>
        </div>
      }

      {
        pool.active &&
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
                {pending ? 'Pending...' : 'Join Pool'}
              </button>
            </form>
            <h3>Pool total {window.web3.utils.fromWei(pool.poolTotal, 'Ether')} ETH</h3>
            <h3>Entries</h3>
            <table className="table table-borderless " style={{ fontSize: 10 }}>
              <thead>
                <tr>
                  <th >Address</th>
                  <th >Value</th>
                  <th >Winning Chance</th>
                </tr>
              </thead>
              <tbody>

                {pool.entries.map((entry) => {
                  return <tr>
                    <td><div className='truncate' title={entry.returnValues._from}> {entry.returnValues._from == account ? 'You' : entry.returnValues._from} </div></td>
                    <td>{window.web3.utils.fromWei(entry.returnValues._value, 'Ether')} ETH</td>
                    <td>{parseFloat(entry.returnValues._value / pool.poolTotal * 100, 2)}%</td>

                  </tr>
                })}


              </tbody>
            </table>
            <button disabled={diableRunPoolButton} className="btn btn-warning" onClick={runPool.bind(this, pool.index)}>Run pool</button>
            {diableRunPoolButton && <p>Pool run enabled at {minRunAt.toDateString()}</p>}
          </div>
        </div>
      }
    </div>
  );
};

export default Pool;