import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";
import {
  ERC20PresetFixedSupply,
  ERC20PresetFixedSupply__factory,
} from "../../typechain";

const STABLECOIN_DECIMALS: number = 6;
const FIAT_DECIMALS: number = 2;

export const signAuthorization = async (
  signer: SignerWithAddress,
  currencyContract: ERC20PresetFixedSupply,
  value: object
) => {
  // All properties on a domain are optional
  const signatureDomain = {
    name: await currencyContract.name(),
    version: await currencyContract.version(),
    chainId: 31337,
    verifyingContract: currencyContract.address,
  };
  // The named list of all type definitions
  const signatureTypes = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };

  const signature = await signer._signTypedData(
    signatureDomain,
    signatureTypes,
    value
  );

  const v = "0x" + signature.slice(130, 132);
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);

  return { v, r, s };
};

export const daysFromBlock = async (days: number) => {
  const blockNumber: number = await ethers.provider.getBlockNumber();
  const timestamp: number = (await ethers.provider.getBlock(blockNumber))
    .timestamp;
  return timestamp + 86400 * days;
};

export const initializeCurrencyContract = async (
  initialBalance: BigNumber,
  beneficiaries: Array<SignerWithAddress>
) => {
  const STABLECOIN_NAME: string = "TEST";
  const CURRENCY_SUPPLY: BigNumber = BigNumber.from("1000000000000");

  const signers: Array<SignerWithAddress> = await ethers.getSigners();
  const currencyOwner = signers[signers.length - 1];

  const currencyFactory: ERC20PresetFixedSupply__factory =
    await ethers.getContractFactory("ERC20PresetFixedSupply", currencyOwner);
  const currencyContract = await currencyFactory.deploy(
    STABLECOIN_NAME,
    STABLECOIN_NAME,
    CURRENCY_SUPPLY,
    currencyOwner.address,
    STABLECOIN_DECIMALS
  );
  await currencyContract.deployed();

  for (let i = 0; i < beneficiaries.length; i++) {
    await currencyContract.transfer(beneficiaries[i].address, initialBalance);
  }

  return currencyContract;
};

export const fiatToStablecoin = (amount: number): BigNumber => {
  const additionalDecimals = STABLECOIN_DECIMALS - FIAT_DECIMALS;

  return BigNumber.from(amount).mul(BigNumber.from(10).pow(additionalDecimals));
};
