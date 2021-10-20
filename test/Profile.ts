import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TransactionResponse } from "@ethersproject/providers";

import type { Profile } from "../typechain";

describe("Profile contract", () => {
  const TEST_USERNAME_1: string = "testUsername1";
  const TEST_URI_1: string = "testURI1";
  const TEST_USERNAME_2: string = "testUsername2";
  const TEST_URI_2: string = "testURI2";

  let profileContract: Profile;
  let defaultAddress: SignerWithAddress;
  let signer2: SignerWithAddress;

  beforeEach(async () => {
    [defaultAddress, signer2] = await ethers.getSigners();

    const profileFactory = await ethers.getContractFactory(
      "Profile",
      defaultAddress
    );
    profileContract = await profileFactory.deploy();
    await profileContract.deployed();

    await profileContract
      .connect(signer2)
      .createProfile(TEST_USERNAME_1, TEST_URI_1);
  });

  describe("createProfile", async () => {
    it("Should create a profile successfully", async () => {
      const tx: TransactionResponse = await profileContract.createProfile(
        TEST_USERNAME_2,
        TEST_URI_2
      );
      await expect(tx)
        .to.be.emit(profileContract, "ProfileCreation")
        .withArgs(defaultAddress.address, TEST_USERNAME_2, TEST_URI_2);
    });

    it("Should fail due to empty username", async () => {
      await expect(
        profileContract.createProfile("", TEST_URI_2)
      ).to.be.revertedWith("ERROR_USERNAME_IS_EMPTY");
    });

    it("Should fail due to empty URI", async () => {
      await expect(
        profileContract.createProfile(TEST_USERNAME_2, "")
      ).to.be.revertedWith("ERROR_URI_IS_EMPTY");
    });

    it("Should fail due to already registered address", async () => {
      await expect(
        profileContract
          .connect(signer2)
          .createProfile(TEST_USERNAME_2, TEST_URI_2)
      ).to.be.revertedWith("ERROR_ADDRESS_ALREADY_REGISTERED");
    });

    it("Should fail due to already registered username", async () => {
      await expect(
        profileContract.createProfile(TEST_USERNAME_1, TEST_URI_2)
      ).to.be.revertedWith("ERROR_USERNAME_NOT_UNIQUE");
    });
  });

  describe("uri", async () => {
    it("Should get correct URI", async () => {
      expect(await profileContract.uri(TEST_USERNAME_1)).to.equals(TEST_URI_1);
    });

    it("Should fail due to inexistent username", async () => {
      await expect(profileContract.uri(TEST_USERNAME_2)).to.be.revertedWith(
        "ERROR_USER_DOES_NOT_EXISTS"
      );
    });
  });

  describe("username", async () => {
    it("Should get correct username", async () => {
      expect(await profileContract.username(signer2.address)).to.equals(
        TEST_USERNAME_1
      );
    });

    it("Should fail due to unregistered address", async () => {
      await expect(
        profileContract.username(defaultAddress.address)
      ).to.be.revertedWith("ERROR_ADDRESS_NOT_REGISTERED");
    });
  });
});
