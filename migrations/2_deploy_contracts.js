
const Raffle = artifacts.require('Raffle');

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Raffle);
  const raffle = await Raffle.deployed();

};
