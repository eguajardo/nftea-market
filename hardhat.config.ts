import { HardhatUserConfig } from "hardhat/types";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-docgen";
import "hardhat-gas-reporter";
import { utils } from "ethers";

import * as dotenv from "dotenv";

dotenv.config();

const TEST_ACCOUNT_BALANCE = utils.parseEther("1000").toString();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.3",
        settings: { optimizer: { enabled: true } },
      },
      { version: "0.6.12", settings: {} },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.RPC_NODE || "https://rpc-mumbai.maticvigil.com",
      },
      accounts: [
        {
          privateKey: process.env.TESTNET_ACCOUNT_1!,
          balance: TEST_ACCOUNT_BALANCE,
        },
        {
          privateKey: process.env.TESTNET_ACCOUNT_2!,
          balance: TEST_ACCOUNT_BALANCE,
        },
        {
          privateKey: process.env.TESTNET_ACCOUNT_3!,
          balance: TEST_ACCOUNT_BALANCE,
        },
        {
          privateKey: process.env.TESTNET_ACCOUNT_4!,
          balance: TEST_ACCOUNT_BALANCE,
        },
        {
          privateKey: process.env.TESTNET_ACCOUNT_5!,
          balance: TEST_ACCOUNT_BALANCE,
        },
      ],
    },
    mumbai: {
      url: process.env.RPC_NODE || "https://rpc-mumbai.maticvigil.com",
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
    except: ["test/"],
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 30,
    showTimeSpent: true,
  },
};
export default config;
