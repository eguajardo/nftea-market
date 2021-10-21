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
  const TEST_CLASS_3_SERIAL_0: BigNumber = BigNumber.from(
    "680564733841876926926749214863536422912"
  );
  const TEST_CLASS_3_SERIAL_1: BigNumber = BigNumber.from(
    "680564733841876926926749214863536422913"
  );
  const TEST_CLASS_1: number = 0;
  const TEST_CLASS_2: number = 1;
  const TEST_CLASS_3: number = 2;
  const TEST_SERIAL_1: number = 1;
  const TEST_URI_1: string = "TEST_URI_1";
  const TEST_URI_2: string = "TEST_URI_2";
  const TEST_URI_3: string = "TEST_URI_3";

  let erc1155Contract: ExposedERC1155Serialized;
  let defaultAddress: SignerWithAddress;
  let receiver: SignerWithAddress;

  beforeEach(async () => {
    [defaultAddress, receiver] = await ethers.getSigners();

    const erc1155Factory = await ethers.getContractFactory(
      "ExposedERC1155Serialized",
      defaultAddress
    );
    erc1155Contract = await erc1155Factory.deploy();
    await erc1155Contract.deployed();

    await erc1155Contract.setURI(TEST_CLASS_1, TEST_URI_1);
    await erc1155Contract.setURI(TEST_CLASS_2, TEST_URI_2);
  });

  describe("_setURI", async () => {
    it("Should emit corresponding event when setting class URI", async () => {
      await expect(await erc1155Contract.setURI(TEST_CLASS_3, TEST_URI_3))
        .to.emit(erc1155Contract, "URI")
        .withArgs(TEST_URI_3, TEST_CLASS_3_SERIAL_0);
    });
  });

  describe("_mintUnserialized", async () => {
    it("Should mint unserialized tokens", async () => {
      await expect(await erc1155Contract.mintUnserialized(TEST_CLASS_3, 15, []))
        .to.emit(erc1155Contract, "TransferSingle")
        .withArgs(
          defaultAddress.address,
          ethers.constants.AddressZero,
          erc1155Contract.address,
          TEST_CLASS_3_SERIAL_0,
          15
        );
    });

    it("Should mint more unserialized tokens", async () => {
      const QUANTITY_1: number = 15;
      const QUANTITY_2: number = 5;

      await erc1155Contract.mintUnserialized(TEST_CLASS_3, QUANTITY_1, []);
      await erc1155Contract.mintUnserialized(TEST_CLASS_3, QUANTITY_2, []);

      expect(
        await erc1155Contract.totalSupply(TEST_CLASS_3_SERIAL_0)
      ).to.equals(QUANTITY_1 + QUANTITY_2);
    });
  });

  describe("_mintSerialized", async () => {
    it("Should mint a serialized token emitting serial mint", async () => {
      await expect(
        erc1155Contract.mintSerialized(receiver.address, TEST_CLASS_3, [])
      )
        .to.emit(erc1155Contract, "SerialMint")
        .withArgs(receiver.address, TEST_CLASS_3, TEST_SERIAL_1);
    });

    it("Should mint a serialized token emitting mint transfer", async () => {
      await expect(
        erc1155Contract.mintSerialized(receiver.address, TEST_CLASS_3, [])
      )
        .to.emit(erc1155Contract, "TransferSingle")
        .withArgs(
          defaultAddress.address,
          ethers.constants.AddressZero,
          receiver.address,
          TEST_CLASS_3_SERIAL_1,
          1
        );
    });

    it("Should mint more serialized tokens", async () => {
      const SERIALIZED_TOKENS: number = 5;

      for (let i = 0; i < SERIALIZED_TOKENS; i++) {
        await erc1155Contract.mintSerialized(
          receiver.address,
          TEST_CLASS_3,
          []
        );
      }

      expect(await erc1155Contract.totalSerialized(TEST_CLASS_3)).to.equals(
        SERIALIZED_TOKENS
      );
    });
  });

  describe("_serializeToken", async () => {
    beforeEach(async () => {
      const QUANTITY_1: number = 15;

      await erc1155Contract.mintUnserialized(TEST_CLASS_3, QUANTITY_1, []);
    });

    it("Should serialize an unserialized token emitting SerialMint", async () => {
      await expect(
        erc1155Contract.serializeToken(receiver.address, TEST_CLASS_3, [])
      )
        .to.emit(erc1155Contract, "SerialMint")
        .withArgs(receiver.address, TEST_CLASS_3, TEST_SERIAL_1);
    });

    it("Should serialize an unserialized token emitting burn", async () => {
      await expect(
        erc1155Contract.serializeToken(receiver.address, TEST_CLASS_3, [])
      )
        .to.emit(erc1155Contract, "TransferSingle")
        .withArgs(
          defaultAddress.address,
          erc1155Contract.address,
          ethers.constants.AddressZero,
          TEST_CLASS_3_SERIAL_0,
          1
        );
    });

    it("Should serialize an unserialized token emitting mint transfer", async () => {
      await expect(
        erc1155Contract.serializeToken(receiver.address, TEST_CLASS_3, [])
      )
        .to.emit(erc1155Contract, "TransferSingle")
        .withArgs(
          defaultAddress.address,
          ethers.constants.AddressZero,
          receiver.address,
          TEST_CLASS_3_SERIAL_1,
          1
        );
    });

    it("Should fail due to not enough unserialized tokens supply", async () => {
      await expect(
        erc1155Contract.serializeToken(receiver.address, TEST_CLASS_2, [])
      ).to.be.revertedWith("ERC1155Serialized: not enough supply");
    });
  });

  describe("_toBaseId", async () => {
    it("Should get right base ID from class", async () => {
      expect(await erc1155Contract.toBaseId(TEST_CLASS_3)).to.equals(
        TEST_CLASS_3_SERIAL_0
      );
    });
  });

  describe("_toId", async () => {
    it("Should get right ID from class and serial", async () => {
      expect(await erc1155Contract.toId(TEST_CLASS_2, TEST_SERIAL_1)).to.equals(
        TEST_CLASS_2_SERIAL_1
      );
    });
  });

  describe("_tokenClass", async () => {
    it("Should get right class from token ID", async () => {
      expect(await erc1155Contract.tokenClass(TEST_CLASS_2_SERIAL_1)).to.equals(
        TEST_CLASS_2
      );
    });
  });

  describe("_tokenSerialNumber", async () => {
    it("Should get right serial number from token ID", async () => {
      expect(await erc1155Contract.tokenClass(TEST_CLASS_2_SERIAL_1)).to.equals(
        TEST_SERIAL_1
      );
    });
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
      ).to.be.revertedWith("ERC1155Serialized: token URI does not exist");
    });
  });
});
