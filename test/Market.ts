import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TransactionResponse } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";

import {
  Market,
  MultiToken,
  MultiToken__factory,
  ERC20PresetFixedSupply,
  ERC20PresetFixedSupply__factory,
  Market__factory,
} from "../typechain";

describe("Market contract", () => {
  const STALL_NAME_REGISTERED: string = "testStallName1";
  const STALL_NAME_UNREGISTERED: string = "testStallName2";
  const TEST_URI_1: string = "testURI1";
  const TEST_URI_2: string = "testURI2";
  const TEST_SUPPLY_1: number = 10;
  const TEST_PRICE_CENTS: number = 100;
  const FIAT_DECIMALS: number = 2;
  const STABLECOIN_DECIMALS: number = 6;
  const CURRENCY_BALANCE: BigNumber = ethers.utils.parseEther("1000000000");

  let marketContract: Market;
  let tokenContract: MultiToken;
  let currencyContract: ERC20PresetFixedSupply;

  let defaultAddress: SignerWithAddress;
  let vendor: SignerWithAddress;
  let currencyOwner: SignerWithAddress;
  let buyer: SignerWithAddress;

  const fiatToStablecoin = (amount: number): BigNumber => {
    const additionalDecimals = STABLECOIN_DECIMALS - FIAT_DECIMALS;

    return BigNumber.from(amount).mul(
      BigNumber.from(10).pow(additionalDecimals)
    );
  };

  beforeEach(async () => {
    [defaultAddress, vendor, currencyOwner, buyer] = await ethers.getSigners();

    const currencyFactory: ERC20PresetFixedSupply__factory =
      await ethers.getContractFactory("ERC20PresetFixedSupply", currencyOwner);
    currencyContract = await currencyFactory.deploy(
      "TEST",
      "TEST",
      CURRENCY_BALANCE,
      buyer.address,
      STABLECOIN_DECIMALS
    );
    await currencyContract.deployed();

    const marketFactory: Market__factory = await ethers.getContractFactory(
      "Market",
      defaultAddress
    );
    marketContract = await marketFactory.deploy(
      currencyContract.address,
      STABLECOIN_DECIMALS
    );
    await marketContract.deployed();

    const tokenFactory: MultiToken__factory = await ethers.getContractFactory(
      "MultiToken"
    );
    tokenContract = tokenFactory.attach(
      await marketContract.tokenContractAddress()
    );

    await marketContract
      .connect(vendor)
      .registerStall(STALL_NAME_REGISTERED, TEST_URI_1);
  });

  describe("registerStall", async () => {
    it("Should register stall successfully", async () => {
      const tx: TransactionResponse = await marketContract.registerStall(
        STALL_NAME_UNREGISTERED,
        TEST_URI_2
      );
      await expect(tx)
        .to.be.emit(marketContract, "StallRegistration")
        .withArgs(defaultAddress.address, STALL_NAME_UNREGISTERED, TEST_URI_2);
    });

    it("Should fail due to empty stall name", async () => {
      await expect(
        marketContract.registerStall("", TEST_URI_2)
      ).to.be.revertedWith("Market: empty stall name");
    });

    it("Should fail due to empty URI", async () => {
      await expect(
        marketContract.registerStall(STALL_NAME_UNREGISTERED, "")
      ).to.be.revertedWith("Market: empty metadata URI");
    });

    it("Should fail due to already registered vendor", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .registerStall(STALL_NAME_UNREGISTERED, TEST_URI_2)
      ).to.be.revertedWith("Market: account already owns a stall");
    });

    it("Should fail due to already registered stall name", async () => {
      await expect(
        marketContract.registerStall(STALL_NAME_REGISTERED, TEST_URI_2)
      ).to.be.revertedWith("Market: stall name already taken");
    });
  });

  describe("postTokenForSale", async () => {
    it("Should emit ClassRegistration when posting token for sale", async () => {
      const REGISTERED_CLASS: number = 1;

      await expect(
        marketContract
          .connect(vendor)
          .postTokenForSale(TEST_URI_1, TEST_SUPPLY_1, TEST_PRICE_CENTS)
      )
        .to.emit(tokenContract, "ClassRegistration")
        .withArgs(REGISTERED_CLASS, TEST_URI_1, TEST_SUPPLY_1);
    });

    it("Should fail due to unregistered vendor", async () => {
      await expect(
        marketContract.postTokenForSale(
          TEST_URI_1,
          TEST_SUPPLY_1,
          TEST_PRICE_CENTS
        )
      ).to.be.revertedWith("Market: account is not a registered vendor");
    });

    it("Should fail due to under price", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .postTokenForSale(TEST_URI_1, TEST_SUPPLY_1, ethers.constants.Zero)
      ).to.be.revertedWith("Market: price less than 100 cents");
    });
  });

  describe("buyToken", async () => {
    const REGISTERED_CLASS: number = 1;

    beforeEach(async () => {
      await marketContract
        .connect(vendor)
        .postTokenForSale(TEST_URI_1, TEST_SUPPLY_1, TEST_PRICE_CENTS);
    });

    it("Should buy token succesfully", async () => {
      currencyContract
        .connect(buyer)
        .approve(marketContract.address, fiatToStablecoin(TEST_PRICE_CENTS));
      await marketContract.connect(buyer).buyToken(REGISTERED_CLASS);

      expect(
        await currencyContract.allowance(buyer.address, marketContract.address)
      ).to.equals(ethers.constants.Zero);
    });
  });

  describe("uri", async () => {
    it("Should get correct URI", async () => {
      expect(await marketContract.uri(STALL_NAME_REGISTERED)).to.equals(
        TEST_URI_1
      );
    });

    it("Should fail due to inexistent stall name", async () => {
      await expect(
        marketContract.uri(STALL_NAME_UNREGISTERED)
      ).to.be.revertedWith("Market: unregistered stall name");
    });
  });

  describe("stallTokens", async () => {
    it("Should return empty array", async () => {
      expect(await marketContract.stallTokens(STALL_NAME_REGISTERED)).to.be
        .empty;
    });

    it("Should return list of tokens for sale in stall", async () => {
      const classes: Array<BigNumber> = [];

      for (let i = 0; i < 10; i++) {
        await marketContract
          .connect(vendor)
          .postTokenForSale(TEST_URI_1, TEST_SUPPLY_1, TEST_PRICE_CENTS);

        classes.push(BigNumber.from(i + 1));
      }

      expect(
        await marketContract.stallTokens(STALL_NAME_REGISTERED)
      ).to.deep.equal(classes);
    });

    it("Should fail due to unregistered stall name", async () => {
      await expect(
        marketContract.stallTokens(STALL_NAME_UNREGISTERED)
      ).to.be.revertedWith("Market: unregistered stall name");
    });
  });

  describe("vendorStallName", async () => {
    it("Should get correct stall name", async () => {
      expect(await marketContract.vendorStallName(vendor.address)).to.equals(
        STALL_NAME_REGISTERED
      );
    });

    it("Should fail due to unregistered account", async () => {
      await expect(
        marketContract.vendorStallName(defaultAddress.address)
      ).to.be.revertedWith("Market: account does not own a stall");
    });
  });

  describe("stallVendor", async () => {
    it("Should return stall vendor address", async () => {
      expect(await marketContract.stallVendor(STALL_NAME_REGISTERED)).to.equals(
        vendor.address
      );
    });

    it("Should fail due to unregistered stall name", async () => {
      await expect(
        marketContract.stallVendor(STALL_NAME_UNREGISTERED)
      ).to.be.revertedWith("Market: unregistered stall name");
    });
  });

  describe("stallNameTaken", async () => {
    it("Should return true", async () => {
      expect(
        await marketContract.stallNameTaken(STALL_NAME_REGISTERED)
      ).to.equals(true);
    });

    it("Should return false", async () => {
      expect(
        await marketContract.stallNameTaken(STALL_NAME_UNREGISTERED)
      ).to.equals(false);
    });
  });
});
