/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_API_KEY",
      accounts: [process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001"],
    },
  },
};