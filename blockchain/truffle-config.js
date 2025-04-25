require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

const privateKey = process.env.PRIVATE_KEY || "";
const infuraKey = process.env.INFURA_API_KEY || "";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    sepolia: {
      provider: () => new HDWalletProvider({
        privateKeys: [privateKey],
        providerOrUrl: `https://sepolia.infura.io/v3/${infuraKey}`,
        numberOfAddresses: 1
      }),
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 10000000000, // 10 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 100000 // Increase timeout to 100 seconds
    },
  },
  compilers: {
    solc: {
      version: "0.8.21",
    }
  }
};