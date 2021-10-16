import { HardhatUserConfig } from "hardhat/types";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-docgen";

import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: "0.8.3", settings: {} }],
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc-mumbai.maticvigil.com",
      },
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [
        process.env.TESTNET_ACCOUNT_1!,
        process.env.TESTNET_ACCOUNT_2!,
        process.env.TESTNET_ACCOUNT_3!,
        process.env.TESTNET_ACCOUNT_4!,
        process.env.TESTNET_ACCOUNT_5!,
      ],
    },
  },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: true,
  },
};
export default config;
