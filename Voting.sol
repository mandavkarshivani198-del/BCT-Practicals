// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters;

    uint256 public candidatesCount;

    event Voted(
        uint256 indexed candidateId,
        address indexed voter
    );

    // Initialize contract with candidate names
    constructor(string[] memory _candidateNames) {

        for (
            uint256 i = 0;
            i < _candidateNames.length;
            i++
        ) {
            addCandidate(_candidateNames[i]);
        }
    }

    function addCandidate(string memory _name) private {

        candidatesCount++;

        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            0
        );
    }

    // Cast a vote
    function vote(uint256 _candidateId) public {

        // Ensure user has not voted already
        require(
            !voters[msg.sender],
            "You have already voted."
        );

        // Ensure candidate ID is valid
        require(
            _candidateId > 0 &&
            _candidateId <= candidatesCount,
            "Invalid candidate ID."
        );

        // Record voter
        voters[msg.sender] = true;

        // Increase vote count
        candidates[_candidateId].voteCount++;

        // Emit event
        emit Voted(
            _candidateId,
            msg.sender
        );
    }
}