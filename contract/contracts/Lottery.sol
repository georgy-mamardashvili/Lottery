// SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.9;
 
contract Lottery {
    address public manager;
    address payable[] public players;
    address public lastWinner;
    
    constructor() {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > 0.01 ether);
        players.push(payable(msg.sender));
    }

    function pickWinner() public onlyManagerRestriction resetAfterExecution {
        uint index = random(players.length);
        players[index].transfer(getBalance());
        lastWinner = address(players[index]);
    }

    function getLastWinner() public view returns (address) {
        return lastWinner;
    } 

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function random(uint maxNumber) private view returns (uint) {
        bytes32 hash = keccak256(abi.encodePacked(block.difficulty,block.timestamp,players));
        return uint(hash) % maxNumber;
    }

    modifier onlyManagerRestriction {
        require(msg.sender == manager);
        _;
    }

    modifier resetAfterExecution {
        _;
        players = new address payable[](0);
    }
}   