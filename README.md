# DeFi Raffle
DeFi Raffle is a decentrailized user-generated raffle. Anyone can create a raffle and promote it. The creator is incentivised to promote the raffle because they set a percent of the total pool they will receive. A use case I can see would be for an influencer to promote their own raffle to make money.

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/JV3eD552Hrc/0.jpg)](https://www.youtube.com/watch?v=JV3eD552Hrc)


# Tech used

DApp developed using the following tech stacks:

- React.js
- Smart Contracts (Solidity)
- Truffle
- Ganache
- Web3.js


## Quick setup and running

- Install node in the local (Node version is v12.18.3 and if possible, use the same version for compatibility).
- Download Ganache from https://www.trufflesuite.com/ganache and install it in the local.
- Run Ganache in the local.

``` bash
$ npm install --g truffle@5.1.39 # If possible, use the same version for compatibility
$ npm install # Or yarn install
$ npm run truffle-compile # Compile smart contracts
$ npm run truffle-migrate # (Or npm run truffle-migrate-reset) Deploy the compiled smart contracts
$ npm start # Run the UI website

```
