// This example code is designed to quickly deploy an example contract using Remix.

pragma solidity 0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
//import "@chainlink/contracts/src/v0.4/Chainlinked.sol";

contract RandomNumberConsumer is VRFConsumerBase {
    
    bytes32 internal keyHash;
    uint256 internal fee;
    
    uint256 public randomResult;
    

    struct  Entry {
        address payable adr;
        uint256 amount;
    }
    Entry[] public entries;
    
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
    }
    
    
    function addAddress() public payable {

        uint256 amount =  msg.value;
        require(amount > 0, "You need to send some Ether");

        entries.push(Entry({
            adr: msg.sender,
            amount: amount
        }));
    }
    
 
     
    function runEntries(uint256 userProvidedSeed) public returns (bytes32 requestId) {
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
        address payable winningAddress;
        
        for (uint i=0; i<entries.length; i++) {
          totalAmount = totalAmount + entries[i].amount;
          if (winningNumber <= totalAmount) {
              winningAddress = entries[i].adr;
              break;
          }
        }
        winningAddress.transfer(address(this).balance);

    }
    
    /**
     * Withdraw LINK from this contract
     * 
     * DO NOT USE THIS IN PRODUCTION AS IT CAN BE CALLED BY ANY ADDRESS.
     * THIS IS PURELY FOR EXAMPLE PURPOSES.
     */
    function withdrawLink() external {
        require(LINK.transfer(msg.sender, LINK.balanceOf(address(this))), "Unable to transfer");
    }
}