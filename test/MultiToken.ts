import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";

import type { MultiToken } from "../typechain";

describe("MultiToken contract", () => {
  const TOKEN_NAME: string = "TOKEN";
  const TOKEN_SYMBOL: string = "TKN";
  const TEST_URI_1: string = "TEST_URI_1";
  const TEST_URI_2: string = "TEST_URI_2";

  const CLASS_LIMITED: number = 1;
  const CLASS_UNLIMITED: number = 2;
  const LIMITED_MAX_SUPPLY: number = 10;
  const CLASS_LIMITED_BASE_ID: BigNumber = BigNumber.from(
    "340282366920938463463374607431768211456"
  );
  const CLASS_UNLIMITED_BASE_ID: BigNumber = BigNumber.from(
    "680564733841876926926749214863536422912"
  );

  const FIRST_CLASS: number = 1;
  const FIRST_CLASS_BASE_ID: BigNumber = BigNumber.from(
    "340282366920938463463374607431768211456"
  );

  const MINTER_ROLE: string =
    "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

  let tokenContract: MultiToken;
  let defaultAddress: SignerWithAddress;
  let receiver: SignerWithAddress;

  beforeEach(async () => {
    [defaultAddress, receiver] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory(
      "MultiToken",
      defaultAddress
    );
    tokenContract = await tokenFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL);
    await tokenContract.deployed();
  });

  describe("name", async () => {
    it("Should return correct token name", async () => {
      expect(await tokenContract.name()).to.equals(TOKEN_NAME);
    });
  });

  describe("symbol", async () => {
    it("Should return correct token symbol", async () => {
      expect(await tokenContract.symbol()).to.equals(TOKEN_SYMBOL);
    });
  });

  describe("registerClass", async () => {
    it("Should register class and return correct value", async () => {
      expect(
        await tokenContract.callStatic.registerClass(
          TEST_URI_1,
          LIMITED_MAX_SUPPLY,
          []
        )
      ).to.equals(FIRST_CLASS);

      await tokenContract.registerClass(TEST_URI_1, LIMITED_MAX_SUPPLY, []);

      expect(
        await tokenContract.callStatic.registerClass(
          TEST_URI_1,
          LIMITED_MAX_SUPPLY,
          []
        )
      ).to.equals(FIRST_CLASS + 1);
    });

    it("Should register class with limited supply emitting class registration", async () => {
      await expect(
        tokenContract.registerClass(TEST_URI_1, LIMITED_MAX_SUPPLY, [])
      )
        .to.emit(tokenContract, "ClassRegistration")
        .withArgs(FIRST_CLASS, TEST_URI_1, LIMITED_MAX_SUPPLY);
    });

    it("Should register class with limited supply emitting mint transfer", async () => {
      await expect(
        tokenContract.registerClass(TEST_URI_1, LIMITED_MAX_SUPPLY, [])
      )
        .to.emit(tokenContract, "TransferSingle")
        .withArgs(
          defaultAddress.address,
          ethers.constants.AddressZero,
          tokenContract.address,
          FIRST_CLASS_BASE_ID,
          LIMITED_MAX_SUPPLY
        );
    });

    it("Should update balance when registering class with limited supply", async () => {
      await tokenContract.registerClass(TEST_URI_1, LIMITED_MAX_SUPPLY, []);

      expect(
        await tokenContract.balanceOf(
          tokenContract.address,
          FIRST_CLASS_BASE_ID
        )
      ).to.equals(LIMITED_MAX_SUPPLY);
    });

    it("Should register class with unlimited supply emitting class registration", async () => {
      const SUPPLY = 0;

      await expect(tokenContract.registerClass(TEST_URI_1, SUPPLY, []))
        .to.emit(tokenContract, "ClassRegistration")
        .withArgs(FIRST_CLASS, TEST_URI_1, SUPPLY);
    });

    it("Should not emit mint transfer", async () => {
      const SUPPLY = 0;

      await expect(
        tokenContract.registerClass(TEST_URI_1, SUPPLY, [])
      ).to.not.emit(tokenContract, "TransferSingle");
    });

    it("Should not update balance when registering class with unlimited supply", async () => {
      const SUPPLY = 0;

      await tokenContract.registerClass(TEST_URI_1, SUPPLY, []);

      expect(
        await tokenContract.balanceOf(
          tokenContract.address,
          FIRST_CLASS_BASE_ID
        )
      ).to.equals(SUPPLY);
    });

    it("Should fail due to unauthorized role", async () => {
      await expect(
        tokenContract
          .connect(receiver)
          .registerClass(TEST_URI_1, LIMITED_MAX_SUPPLY, [])
      ).to.be.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${MINTER_ROLE}`
      );
    });

    it("Should fail due to empty URI", async () => {
      await expect(
        tokenContract.registerClass("", LIMITED_MAX_SUPPLY, [])
      ).to.be.revertedWith("MultiToken: URI cannot be empty");
    });
  });

  describe("mint", async () => {
    beforeEach(async () => {
      await tokenContract.registerClass(TEST_URI_1, LIMITED_MAX_SUPPLY, []);
      await tokenContract.registerClass(TEST_URI_2, 0, []);
    });

    it("Should mint serialized token from limited class", async () => {
      const NEXT_SERIAL = 1;

      await expect(tokenContract.mint(receiver.address, CLASS_LIMITED, []))
        .to.emit(tokenContract, "SerialMint")
        .withArgs(receiver.address, CLASS_LIMITED, NEXT_SERIAL);

      expect(
        await tokenContract.balanceOf(
          receiver.address,
          CLASS_LIMITED_BASE_ID.add(1)
        )
      ).to.equals(NEXT_SERIAL);

      expect(
        await tokenContract.balanceOf(
          tokenContract.address,
          CLASS_LIMITED_BASE_ID
        )
      ).to.equals(LIMITED_MAX_SUPPLY - NEXT_SERIAL);
    });

    it("Should mint serialized token from unlimited class", async () => {
      const NEXT_SERIAL = 1;

      await expect(tokenContract.mint(receiver.address, CLASS_UNLIMITED, []))
        .to.emit(tokenContract, "SerialMint")
        .withArgs(receiver.address, CLASS_UNLIMITED, NEXT_SERIAL);

      expect(
        await tokenContract.balanceOf(
          receiver.address,
          CLASS_UNLIMITED_BASE_ID.add(1)
        )
      ).to.equals(NEXT_SERIAL);

      expect(
        await tokenContract.balanceOf(
          tokenContract.address,
          CLASS_UNLIMITED_BASE_ID
        )
      ).to.equals(0);
    });

    it("Should mint all tokens from limited class", async () => {
      for (let i = 0; i < LIMITED_MAX_SUPPLY - 1; i++) {
        await tokenContract.mint(receiver.address, CLASS_LIMITED, []);
      }

      await expect(tokenContract.mint(receiver.address, CLASS_LIMITED, []))
        .to.emit(tokenContract, "SerialMint")
        .withArgs(receiver.address, CLASS_LIMITED, LIMITED_MAX_SUPPLY);

      expect(
        await tokenContract.balanceOf(
          receiver.address,
          CLASS_LIMITED_BASE_ID.add(LIMITED_MAX_SUPPLY)
        )
      ).to.equals(1);

      expect(
        await tokenContract.balanceOf(
          tokenContract.address,
          CLASS_LIMITED_BASE_ID
        )
      ).to.equals(0);
    });

    it("Should fail due to unauthorized role", async () => {
      await expect(
        tokenContract
          .connect(receiver)
          .mint(receiver.address, CLASS_LIMITED, [])
      ).to.be.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${MINTER_ROLE}`
      );
    });

    it("Should fail due to transfer to zero address", async () => {
      await expect(
        tokenContract.mint(ethers.constants.AddressZero, CLASS_LIMITED, [])
      ).to.be.revertedWith("MultiToken: mint to zero address");
    });

    it("Should fail due to minting of zero class", async () => {
      await expect(
        tokenContract.mint(receiver.address, 0, [])
      ).to.be.revertedWith("MultiToken: reserved zero class");
    });

    it("Should fail due to minting of unregistered class", async () => {
      await expect(
        tokenContract.mint(
          receiver.address,
          CLASS_LIMITED + CLASS_UNLIMITED,
          []
        )
      ).to.be.revertedWith("MultiToken: unregistered class");
    });

    it("Should fail due to not enough supply", async () => {
      for (let i = 0; i < LIMITED_MAX_SUPPLY; i++) {
        await tokenContract.mint(receiver.address, CLASS_LIMITED, []);
      }

      await expect(
        tokenContract.mint(receiver.address, CLASS_LIMITED, [])
      ).to.be.revertedWith("ERC1155Serialized: not enough supply");
    });
  });
});
