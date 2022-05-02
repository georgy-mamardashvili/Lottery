// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address[] public players;
    
    constructor() {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > 0.01 ether);
        players.push(msg.sender);
    }

    function pickWinner() public onlyManagerRestriction resetAfterExecution {
        uint index = random(players.length);
        payable(players[index]).transfer(getBalance());
    }

    function returnEntries() public onlyManagerRestriction resetAfterExecution{
        uint averageEntry = getBalance() / players.length;
        for (uint i=0; i<players.length; i++) {
            payable(players[i]).transfer(averageEntry);
        }
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getPlayers() public view returns (address[] memory) {
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
        players = new address[](0);
    }
}