import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";

import type { ExposedERC1155Serialized } from "../typechain";

describe("ERC1155Serialized contract", () => {
  // Conversions taken from https://www.rapidtables.com/convert/number/binary-to-hex.html
  const TEST_CLASS_1_SERIAL_1: BigNumber = BigNumber.from(1);
  const TEST_CLASS_1_SERIAL_2: BigNumber = BigNumber.from(2);
  const TEST_CLASS_2_SERIAL_1: BigNumber = BigNumber.from(
    "340282366920938463463374607431768211457"
  );
  const TEST_CLASS_3_SERIAL_1: BigNumber = BigNumber.from(
    "680564733841876926926749214863536422913"
  );
  const TEST_CLASS_1: number = 0;
  const TEST_CLASS_2: number = 1;
  const TEST_SERIAL_1: number = 1;
  const TEST_URI_1: string = "TEST_URI_1";
  const TEST_URI_2: string = "TEST_URI_2";

  let erc1155Contract: ExposedERC1155Serialized;
  let defaultAddress: SignerWithAddress;

  beforeEach(async () => {
    [defaultAddress] = await ethers.getSigners();

    const erc1155Factory = await ethers.getContractFactory(
      "ExposedERC1155Serialized",
      defaultAddress
    );
    erc1155Contract = await erc1155Factory.deploy();
    await erc1155Contract.deployed();

    await erc1155Contract.setURI(TEST_CLASS_1, TEST_URI_1);
    await erc1155Contract.setURI(TEST_CLASS_2, TEST_URI_2);
  });

  describe("uri", async () => {
    it("Should get correct URI", async () => {
      expect(await erc1155Contract.uri(TEST_CLASS_1_SERIAL_1)).to.equals(
        TEST_URI_1
      );
    });

    it("Should get correct URI with different ID same class", async () => {
      expect(await erc1155Contract.uri(TEST_CLASS_1_SERIAL_2)).to.equals(
        TEST_URI_1
      );
    });

    it("Should get correct URI with different ID different class", async () => {
      expect(await erc1155Contract.uri(TEST_CLASS_2_SERIAL_1)).to.equals(
        TEST_URI_2
      );
    });

    it("Should fail due to inexistent URI", async () => {
      await expect(
        erc1155Contract.uri(TEST_CLASS_3_SERIAL_1)
      ).to.be.revertedWith("ERROR_TOKEN_DOES_NOT_EXISTS");
    });
  });

  describe("toId", async () => {
    it("Should get right ID from class and serial", async () => {
      expect(await erc1155Contract.toId(TEST_CLASS_2, TEST_SERIAL_1)).to.equals(
        TEST_CLASS_2_SERIAL_1
      );
    });
  });

  describe("tokenClass", async () => {
    it("Should get right class from token ID", async () => {
      expect(await erc1155Contract.tokenClass(TEST_CLASS_2_SERIAL_1)).to.equals(
        TEST_CLASS_2
      );
    });
  });

  describe("tokenSerialNumber", async () => {
    it("Should get right serial number from token ID", async () => {
      expect(await erc1155Contract.tokenClass(TEST_CLASS_2_SERIAL_1)).to.equals(
        TEST_SERIAL_1
      );
    });
  });
});
