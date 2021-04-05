
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
  account,
  activePools,
  createNewPool,
  loadPool,
  pendingNewPool
}) => {
  const inputRef = React.useRef(null);
  const nextRunRef = React.useRef(null);
  const percentFeeRef = React.useRef(null);
  const titleRef = React.useRef(null);

  const handleSubmit = event => {
    event.preventDefault();
    let amount = inputRef.current.value.toString();
    amount = window.web3.utils.toWei(amount, 'Ether');
    addToPool(amount)
  };

  const handleCreatePoolSubmit = (event) => {
    event.preventDefault();
    createNewPool(nextRunRef.current.value.toString(), percentFeeRef.current.value.toString(), titleRef.current.value.toString())
  }

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
            onSubmit={handleCreatePoolSubmit}>


            <div class="form-group row">
              <label for="staticEmail" class="col-sm-6 col-form-label">Title</label>
              <div class="col-sm-6">
                <input
                  type="text"
                  ref={titleRef}
                  className="form-control "
                  placeholder="title"
                  required />
              </div>
            </div>


            <div class="form-group row">
              <label for="staticEmail" class="col-sm-6 col-form-label">Run no earlier than date</label>
              <div class="col-sm-6">
                <input
                  type="date"
                  ref={nextRunRef}
                  className="form-control "
                  placeholder="min run date"
                  required />
              </div>
            </div>

            <div class="form-group row">
              <label for="staticEmail" class="col-sm-6 col-form-label">Percent fee of pool to creator</label>
              <div class="col-sm-6">
                <input
                  type="number"
                  ref={percentFeeRef}
                  className="form-control "
                  placeholder="percent fee to pool creator"
                  required />
              </div>
            </div>

            <button
              type="submit"
              disabled={pendingNewPool }
              className="btn btn-primary btn-block btn-lg">
              {pendingNewPool ? 'Creating pool...' : 'Create new pool'}
            </button>
          </form>




          <h3>Most Recent Pools</h3>
          <table className="table table-borderless " style={{ fontSize: 10 }}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">title</th>
                <th scope="col">Created at</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>

              {_.reverse(activePools).map((entry, i) => {
                return <tr>
                  <th scope="row">{i + 1}</th>
                  <td>
                    {window.web3.utils.hexToAscii(entry.returnValues._title)}

                  </td>

                  <td>

                    {entry.timestamp.toDateString()}
                  </td>

                  <td>
                    <button className="btn btn-warning btn-sm" onClick={loadPool.bind(this, entry.returnValues._poolIndex)}>View</button>
                  </td>

                </tr>
              })}


            </tbody>
          </table>




        </div>
      </div>
    </div>
  );
};

export default Main;
