// This example code is designed to quickly deploy an example contract using Remix.

pragma solidity 0.6.6;

import "https://raw.githubusercontent.com/smartcontractkit/chainlink/master/evm-contracts/src/v0.6/VRFConsumerBase.sol";

contract RandomNumberConsumer is VRFConsumerBase {
    
    bytes32 internal keyHash;
    uint256 internal fee;
    address payable owner;
    uint poolCount;

    struct  Entry {
        address payable adr;
        uint256 amount;
    }
    
    struct Pool {
        int  entryCount;
        uint256  randomResult;
        address payable winningAddress;
        address payable owner;
        uint256  nextRunDate;
        Entry[]  entries;
        uint ownerPercentFee;
        bool active;
        bytes16 title; 
        uint256 index;
        uint256 poolTotal;
        uint256 winningAmount;
    }
    
    uint256 public contractOwnerFee;
    
    mapping(uint => Pool) public pools;
    
    mapping(bytes32 => uint256) private randomMappings;
  
    event NewAddress(address _from, uint256 _value, uint256 indexed _poolIndex);
    event NewWinner(address _winner, uint256 _value, bytes16 _title);
    event NewPool(uint256 _nextRunDate, bytes16 _title, uint256 indexed _poolIndex);
    
    
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
        poolCount = 0;
    }
    
    function addPool(uint256 _nextRunDate, uint _ownerPercentFee, bytes16 _title) public payable {
        require(_ownerPercentFee < 99, "owner fee is too high");
        require(_nextRunDate < now + (365 * 1 days), "next run date must be less than one year in the future");
        poolCount = poolCount + 1;
        Pool storage _pool = pools[poolCount];
        
        _pool.owner = msg.sender;
        _pool.nextRunDate= _nextRunDate;
        _pool.ownerPercentFee = _ownerPercentFee;
        _pool.title = _title;
        _pool.active = true;
        _pool.index = poolCount;
      
        emit NewPool(_nextRunDate, _title, poolCount);
    }
    
    function addAddress(uint256 poolIndex) public payable {
        uint256 amount =  msg.value;
        require(amount > 0, "You need to send some Ether");
        Pool memory _memPool = pools[poolIndex];
        
        require(_memPool.active == true, "Pool must be active");
        
        pools[poolIndex].entries.push(Entry({
            adr: msg.sender,
            amount: amount
        }));
        
        pools[poolIndex].entryCount = pools[poolIndex].entryCount + 1;
        pools[poolIndex].poolTotal = pools[poolIndex].poolTotal.add(amount);
        
        emit NewAddress(msg.sender, amount, poolIndex);
    }
    
     
    function runEntries(uint256 userProvidedSeed, uint256 poolIndex) public{
        Pool memory pool = pools[poolIndex];
        
        require(pool.nextRunDate < now || owner == msg.sender, "Pool can only be ran past the run date");
        
        require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
        bytes32 requestId = requestRandomness(keyHash, fee, userProvidedSeed);
        randomMappings[requestId] = poolIndex;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomResult) internal override {
        Pool memory _memPool = pools[randomMappings[requestId]];
        
        uint256 totalAmount = 0;
        for (uint i=0; i<_memPool.entries.length; i++) {
          totalAmount = totalAmount.add(_memPool.entries[i].amount);
        }
        
        uint256 winningNumber = randomResult % totalAmount;
        uint256 runningAmount = 0;
        for (uint i=0; i<_memPool.entries.length; i++) {
            
          runningAmount = runningAmount.add(_memPool.entries[i].amount) ;
          if (runningAmount >= winningNumber ) {
              _memPool.winningAddress = _memPool.entries[i].adr;
              break;
          }
        }
        
        uint256 _localContractOwnerFee =  totalAmount.div(100);
        contractOwnerFee = contractOwnerFee.add(_localContractOwnerFee);

        totalAmount = totalAmount.sub(_localContractOwnerFee);
        
        uint256 ownerFee = totalAmount.mul(_memPool.ownerPercentFee.div(100));
        _memPool.owner.transfer(ownerFee);
        totalAmount = totalAmount.sub(ownerFee);
        
        emit NewWinner(_memPool.winningAddress, totalAmount, _memPool.title);
        
        _memPool.winningAddress.transfer(totalAmount);
        pools[_memPool.index].active = false;
        pools[randomMappings[requestId]].winningAddress = _memPool.winningAddress ;
        pools[_memPool.index].randomResult = randomResult;

        delete pools[randomMappings[requestId]].entries; 
        
    }
    
    function withdraw() public {
        require(owner == msg.sender);
        owner.transfer(contractOwnerFee);
        contractOwnerFee = 0;
    }
    
}