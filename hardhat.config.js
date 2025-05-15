/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/jjtEulBKoXYssHNqKVz8BciDZnWfZWdw",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
  },
};