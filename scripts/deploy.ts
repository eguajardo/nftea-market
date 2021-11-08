import { artifacts, ethers, network } from "hardhat";
import { Contract } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { contracts } from "../helpers/contracts";
import {
  ERC20PresetFixedSupply,
  ERC20PresetFixedSupply__factory,
  Market__factory,
  MultiToken,
  SponsorshipEscrow,
} from "../typechain";

const NETWORKS_LOCAL: Array<string> = ["hardhat", "localhost"];
const NETWORKS_TESTNETS: Array<string> = [...NETWORKS_LOCAL, "mumbai"];
const ERC20_CURRENCY_DECIMALS: number = 6;
const CONTRACTS_FILENAME: string = "contracts.ts";

const deployedContracts: Map<string, Contract> = new Map();

const main = async () => {
  console.log("Deploying to network:", network.name);

  if (NETWORKS_TESTNETS.includes(network.name)) {
    await deployTestCurrency();
  }
  await deployMarketContract(
    deployedContracts.get("ERC20PresetFixedSupply")!.address
  );

  saveContractFiles();
  copyTypingsToFrontend();
};

const deployMarketContract = async (currencyContractAddress: string) => {
  const marketFactory: Market__factory = await ethers.getContractFactory(
    "Market"
  );
  const marketContract = await marketFactory.deploy(
    currencyContractAddress,
    ERC20_CURRENCY_DECIMALS
  );
  await marketContract.deployed();

  const nftContract: MultiToken = await ethers.getContractAt(
    "MultiToken",
    await marketContract.nftContract()
  );

  const escrowContract: SponsorshipEscrow = await ethers.getContractAt(
    "SponsorshipEscrow",
    await marketContract.escrow()
  );

  deployedContracts.set("Market", marketContract);
  deployedContracts.set("MultiToken", nftContract);
  deployedContracts.set("SponsorshipEscrow", escrowContract);
};

/**
 * Deploy Test ERC20 used as currency in the platform
 */
const deployTestCurrency = async () => {
  const TEST_CURRENCY_NAME: string = "Test USD Coin";
  const TEST_CURRENCY_SYMBOL: string = "TestUSDC";
  const CURRENCY_SUPPLY: BigNumber = BigNumber.from("1000000000000"); // 1,000,000 USDC
  const ACCOUNT_BALANCE: BigNumber = BigNumber.from("200000000"); // 200 USDC

  const currencyFactory: ERC20PresetFixedSupply__factory =
    await ethers.getContractFactory("ERC20PresetFixedSupply");

  const signers = await ethers.getSigners();
  const owner = signers[signers.length - 1];

  const testCurrencyContract: ERC20PresetFixedSupply =
    await currencyFactory.deploy(
      TEST_CURRENCY_NAME,
      TEST_CURRENCY_SYMBOL,
      CURRENCY_SUPPLY,
      owner.address,
      ERC20_CURRENCY_DECIMALS
    );

  await testCurrencyContract.deployed();
  deployedContracts.set("ERC20PresetFixedSupply", testCurrencyContract);

  for (let i = 0; i < signers.length - 1; i++) {
    await testCurrencyContract
      .connect(owner)
      .transfer(signers[i].address, ACCOUNT_BALANCE);
  }
};

const saveContractFiles = () => {
  const fs = require("fs");
  const frontEndDir = __dirname + "/../frontend/src/helpers/";
  const backEndDir = __dirname + "/../helpers/";

  if (!fs.existsSync(frontEndDir)) {
    fs.mkdirSync(frontEndDir);
  }

  if (!fs.existsSync(backEndDir)) {
    fs.mkdirSync(backEndDir);
  }

  let newContracts: any = { ...contracts, [network.name]: {} };
  deployedContracts.forEach((value: Contract, key: string) => {
    const artifact = artifacts.readArtifactSync(key);

    newContracts[network.name][key] = {
      address: value.address,
      abi: artifact.abi,
    };

    console.log(key, "contract deployed at address:", value.address);
  });

  newContracts[network.name]["PaymentSplitter"] = {
    abi: artifacts.readArtifactSync("PaymentSplitter").abi,
  };

  const content: string =
    "export const contracts: any = " +
    JSON.stringify(newContracts, null, 2) +
    ";";

  fs.writeFileSync(frontEndDir + CONTRACTS_FILENAME, content);
  fs.writeFileSync(backEndDir + CONTRACTS_FILENAME, content);
};

const copyTypingsToFrontend = () => {
  const fs = require("fs-extra");
  const source = __dirname + "/../typechain";
  const destination = __dirname + "/../frontend/src/types/typechain";

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  fs.copySync(source, destination);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
