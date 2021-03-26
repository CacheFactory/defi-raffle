// This example code is designed to quickly deploy an example contract using Remix.

pragma solidity 0.6.6;

import "https://raw.githubusercontent.com/smartcontractkit/chainlink/master/evm-contracts/src/v0.6/VRFConsumerBase.sol";

contract RandomNumberConsumer is VRFConsumerBase {
    
    bytes32 internal keyHash;
    uint256 internal fee;
    int public entryCount;
    uint256 public randomResult;
    address payable winningAddress;
    address payable owner;
    int public runNumber;
    uint256 public nextRunDate;

    struct  Entry {
        address payable adr;
        uint256 amount;
    }
    
    Entry[] public entries;
  
    event NewAddress(address _from, uint256 _value, int indexed _runNumber);
    event NewWinner(address _from, uint256 _value, int indexed _runNumber);
    
    /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor() 
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token
        ) public
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
        owner = 0x666eCA3575077E28CE77eA6a454Dbd47ec33E778;
        runNumber = 0;
        nextRunDate = now + (60 * 60 * 24);
    }
    
    
    function addAddress() public payable {

        uint256 amount =  msg.value;
        require(amount > 0, "You need to send some Ether");

        entries.push(Entry({
            adr: msg.sender,
            amount: amount
        }));
        
        entryCount = entryCount + 1;
        
        emit NewAddress(msg.sender, msg.value, runNumber);
    }
    
     
    function runEntries(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(owner == msg.sender);
        require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
        
        uint256 totalAmount = 0;
        for (uint i=0; i<entries.length; i++) {
          totalAmount = totalAmount + entries[i].amount;
        }
        
        uint256 winningNumber = randomness % totalAmount;
        uint256 runningAmount = 0;
        for (uint i=0; i<entries.length; i++) {
          runningAmount = runningAmount + entries[i].amount;
          if (runningAmount >= winningNumber ) {
              winningAddress = entries[i].adr;
              break;
          }
          
        }
        
        owner.transfer(address(this).balance / 100);
        
        emit NewWinner(winningAddress, address(this).balance, runNumber);
        
        winningAddress.transfer(address(this).balance);
        runNumber = runNumber + 1;
        nextRunDate = now + (60 * 60 * 24);
        delete entries;
    }
    
}