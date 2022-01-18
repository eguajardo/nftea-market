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
const TEST_ACCOUNTS = [
  process.env.TESTNET_ACCOUNT_1!,
  process.env.TESTNET_ACCOUNT_2!,
  process.env.TESTNET_ACCOUNT_3!,
  process.env.TESTNET_ACCOUNT_4!,
  process.env.TESTNET_ACCOUNT_5!,
  process.env.TESTNET_ACCOUNT_6!,
  process.env.TESTNET_ACCOUNT_7!,
  process.env.TESTNET_ACCOUNT_8!,
  process.env.TESTNET_ACCOUNT_9!,
  process.env.TESTNET_ACCOUNT_10!,
];

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
        url: process.env.RPC_NODE!,
        blockNumber: 21063861,
      },
      accounts: TEST_ACCOUNTS.map((account) => {
        return {
          privateKey: account,
          balance: TEST_ACCOUNT_BALANCE,
        };
      }),
    },
    mumbai: {
      url: process.env.RPC_NODE || "https://rpc-mumbai.maticvigil.com",
      accounts: TEST_ACCOUNTS,
    },
    BSCTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: TEST_ACCOUNTS,
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
