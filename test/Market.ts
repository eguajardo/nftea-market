import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TransactionResponse } from "@ethersproject/providers";

import type { Market } from "../typechain";

describe("Market contract", () => {
  const TEST_STALL_NAME_1: string = "testStallName1";
  const TEST_URI_1: string = "testURI1";
  const TEST_STALL_NAME_2: string = "testStallName2";
  const TEST_URI_2: string = "testURI2";

  let marketContract: Market;
  let defaultAddress: SignerWithAddress;
  let signer2: SignerWithAddress;

  beforeEach(async () => {
    [defaultAddress, signer2] = await ethers.getSigners();

    const marketFactory = await ethers.getContractFactory(
      "Market",
      defaultAddress
    );
    marketContract = await marketFactory.deploy();
    await marketContract.deployed();

    await marketContract
      .connect(signer2)
      .registerStall(TEST_STALL_NAME_1, TEST_URI_1);
  });

  describe("registerStall", async () => {
    it("Should register stall successfully", async () => {
      const tx: TransactionResponse = await marketContract.registerStall(
        TEST_STALL_NAME_2,
        TEST_URI_2
      );
      await expect(tx)
        .to.be.emit(marketContract, "StallRegistration")
        .withArgs(defaultAddress.address, TEST_STALL_NAME_2, TEST_URI_2);
    });

    it("Should fail due to empty stall name", async () => {
      await expect(
        marketContract.registerStall("", TEST_URI_2)
      ).to.be.revertedWith("Market: empty stall name");
    });

    it("Should fail due to empty URI", async () => {
      await expect(
        marketContract.registerStall(TEST_STALL_NAME_2, "")
      ).to.be.revertedWith("Market: empty metadata URI");
    });

    it("Should fail due to already registered vendro", async () => {
      await expect(
        marketContract
          .connect(signer2)
          .registerStall(TEST_STALL_NAME_2, TEST_URI_2)
      ).to.be.revertedWith("Market: account already owns a stall");
    });

    it("Should fail due to already registered stall name", async () => {
      await expect(
        marketContract.registerStall(TEST_STALL_NAME_1, TEST_URI_2)
      ).to.be.revertedWith("Market: stall name already taken");
    });
  });

  describe("uri", async () => {
    it("Should get correct URI", async () => {
      expect(await marketContract.uri(TEST_STALL_NAME_1)).to.equals(TEST_URI_1);
    });

    it("Should fail due to inexistent stall name", async () => {
      await expect(marketContract.uri(TEST_STALL_NAME_2)).to.be.revertedWith(
        "Market: unregistered stall name"
      );
    });
  });

  describe("vendorStallName", async () => {
    it("Should get correct stall name", async () => {
      expect(await marketContract.vendorStallName(signer2.address)).to.equals(
        TEST_STALL_NAME_1
      );
    });

    it("Should fail due to unregistered account", async () => {
      await expect(
        marketContract.vendorStallName(defaultAddress.address)
      ).to.be.revertedWith("Market: account does not own a stall");
    });
  });

  describe("stallNameTaken", async () => {
    it("Should return true", async () => {
      expect(await marketContract.stallNameTaken(TEST_STALL_NAME_1)).to.equals(
        true
      );
    });

    it("Should return false", async () => {
      expect(await marketContract.stallNameTaken(TEST_STALL_NAME_2)).to.equals(
        false
      );
    });
  });
});
