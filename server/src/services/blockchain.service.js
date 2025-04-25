// server/src/services/blockchain.service.js
const { ethers } = require('ethers');
const contractABI = require('../config/EVotingABI.json');

// Load environment variables
const contractAddress = process.env.CONTRACT_ADDRESS;
const providerUrl = process.env.BLOCKCHAIN_PROVIDER_URL;
const privateKey = process.env.ADMIN_PRIVATE_KEY;

// Initialize ethers provider and contract - updated for ethers v6
const provider = new ethers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Create a new election on the blockchain
exports.createElection = async (electionId, name, startTime, endTime) => {
  try {
    // Convert times to UNIX timestamps
    const startUnix = Math.floor(new Date(startTime).getTime() / 1000);
    const endUnix = Math.floor(new Date(endTime).getTime() / 1000);
    
    // Call the smart contract
    const tx = await contract.createElection(electionId, name, startUnix, endUnix);
    await tx.wait();
    
    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error('Blockchain error:', error);
    throw new Error('Failed to create election on blockchain');
  }
};

// Add a candidate on the blockchain
exports.addCandidate = async (candidateId, name, party) => {
  try {
    const tx = await contract.addCandidate(candidateId, name, party);
    await tx.wait();
    
    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error('Blockchain error:', error);
    throw new Error('Failed to add candidate on blockchain');
  }
};

// Cast a vote on the blockchain
exports.castVote = async (electionId, candidateId, voterAddress) => {
  try {
    // Generate a secret hash - updated for ethers v6
    const secretHash = ethers.id(Date.now().toString());
    
    // Cast vote
    const tx = await contract.castVote(electionId, candidateId, secretHash);
    await tx.wait();
    
    // Generate vote hash for verification (same calculation as in the smart contract) - updated for ethers v6
    const voteHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'uint256', 'uint256', 'bytes32'],
        [voterAddress, electionId, candidateId, secretHash]
      )
    );
    
    return { 
      success: true, 
      transactionHash: tx.hash,
      voteHash
    };
  } catch (error) {
    console.error('Blockchain error:', error);
    throw new Error('Failed to cast vote on blockchain');
  }
};

// Verify a vote on the blockchain
exports.verifyVote = async (voteHash) => {
  try {
    const isValid = await contract.verifyVote(voteHash);
    return { success: true, verified: isValid };
  } catch (error) {
    console.error('Blockchain error:', error);
    throw new Error('Failed to verify vote on blockchain');
  }
};

// Publish election results on the blockchain
exports.publishResults = async (electionId) => {
  try {
    const tx = await contract.publishResults(electionId);
    await tx.wait();
    
    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error('Blockchain error:', error);
    throw new Error('Failed to publish results on blockchain');
  }
};

// Get candidate votes from the blockchain (after results are published)
exports.getCandidateVotes = async (electionId, candidateId) => {
  try {
    const votes = await contract.getCandidateVotes(electionId, candidateId);
    return { success: true, votes: Number(votes) }; // Updated for ethers v6
  } catch (error) {
    console.error('Blockchain error:', error);
    throw new Error('Failed to get candidate votes from blockchain');
  }
};