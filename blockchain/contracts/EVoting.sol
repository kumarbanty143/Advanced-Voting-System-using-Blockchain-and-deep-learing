// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EVoting {
    // Admin address
    address public admin;
    
    // Election structure
    struct Election {
        uint256 id;
        string name;
        uint256 startTime;
        uint256 endTime;
        bool resultsPublished;
    }
    
    // Candidate structure
    struct Candidate {
        uint256 id;
        string name;
        string party;
    }
    
    // Vote structure (private)
    struct Vote {
        address voter;
        uint256 electionId;
        uint256 candidateId;
        uint256 timestamp;
        bytes32 voteHash;
    }
    
    // Mappings
    mapping(uint256 => Election) public elections;
    mapping(uint256 => Candidate) public candidates;
    mapping(uint256 => mapping(uint256 => uint256)) private electionCandidateVotes; // electionId => candidateId => voteCount
    mapping(address => mapping(uint256 => bool)) private hasVoted; // voter => electionId => hasVoted
    mapping(bytes32 => bool) private voteHashes; // voteHash => exists
    
    // Events
    event ElectionCreated(uint256 electionId, string name, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 candidateId, string name, string party);
    event VoteCast(bytes32 voteHash, uint256 electionId, uint256 timestamp);
    event ResultsPublished(uint256 electionId);
    
    // Constructor
    constructor() {
        admin = msg.sender;
    }
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].id == _electionId, "Election does not exist");
        _;
    }
    
    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].id == _electionId, "Election does not exist");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started yet");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }
    
    // Admin Functions
    
    // Create a new election
    function createElection(uint256 _electionId, string memory _name, uint256 _startTime, uint256 _endTime) public onlyAdmin {
        require(elections[_electionId].id != _electionId, "Election ID already exists");
        require(_startTime < _endTime, "End time must be after start time");
        
        elections[_electionId] = Election({
            id: _electionId,
            name: _name,
            startTime: _startTime,
            endTime: _endTime,
            resultsPublished: false
        });
        
        emit ElectionCreated(_electionId, _name, _startTime, _endTime);
    }
    
    // Add a candidate
    function addCandidate(uint256 _candidateId, string memory _name, string memory _party) public onlyAdmin {
        require(candidates[_candidateId].id != _candidateId, "Candidate ID already exists");
        
        candidates[_candidateId] = Candidate({
            id: _candidateId,
            name: _name,
            party: _party
        });
        
        emit CandidateAdded(_candidateId, _name, _party);
    }
    
    // Publish results
    function publishResults(uint256 _electionId) public onlyAdmin electionExists(_electionId) {
        require(block.timestamp > elections[_electionId].endTime, "Election is still active");
        require(!elections[_electionId].resultsPublished, "Results already published");
        
        elections[_electionId].resultsPublished = true;
        
        emit ResultsPublished(_electionId);
    }
    
    // Voting Functions
    
    // Cast a vote
    function castVote(uint256 _electionId, uint256 _candidateId, bytes32 _secretHash) public electionActive(_electionId) {
        require(!hasVoted[msg.sender][_electionId], "You have already voted in this election");
        require(candidates[_candidateId].id == _candidateId, "Candidate does not exist");
        
        // Create vote hash (for verification)
        bytes32 voteHash = keccak256(abi.encodePacked(msg.sender, _electionId, _candidateId, _secretHash));
        require(!voteHashes[voteHash], "Vote hash already exists");
        
        // Record vote
        electionCandidateVotes[_electionId][_candidateId]++;
        hasVoted[msg.sender][_electionId] = true;
        voteHashes[voteHash] = true;
        
        emit VoteCast(voteHash, _electionId, block.timestamp);
    }
    
    // Public Views
    
    // Check if voter has voted
    function voterHasVoted(address _voter, uint256 _electionId) public view returns (bool) {
        return hasVoted[_voter][_electionId];
    }
    
    // Verify vote hash
    function verifyVote(bytes32 _voteHash) public view returns (bool) {
        return voteHashes[_voteHash];
    }
    
    // Get candidate vote count (only after results are published)
    function getCandidateVotes(uint256 _electionId, uint256 _candidateId) public view returns (uint256) {
        require(elections[_electionId].resultsPublished, "Results are not published yet");
        return electionCandidateVotes[_electionId][_candidateId];
    }
}