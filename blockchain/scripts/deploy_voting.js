const EVoting = artifacts.require("EVoting");

module.exports = async function(callback) {
  try {
    // Deploy the contract
    console.log("Deploying EVoting contract...");
    const evoting = await EVoting.new();
    
    console.log("Contract deployed at:", evoting.address);
    console.log("IMPORTANT: Copy this address for your .env file");
    
    // Complete the process
    callback();
  } catch (error) {
    console.error("Error during deployment:", error);
    callback(error);
  }
};