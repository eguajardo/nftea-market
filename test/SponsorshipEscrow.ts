import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";
import { signAuthorization } from "./utils/signatureUtils";

import {
  ERC20PresetFixedSupply,
  ERC20PresetFixedSupply__factory,
  SponsorshipEscrow,
  SponsorshipEscrow__factory,
} from "../typechain";

const daysFromBlock = async (days: number) => {
  const blockNumber: number = await ethers.provider.getBlockNumber();
  const timestamp: number = (await ethers.provider.getBlock(blockNumber))
    .timestamp;
  return timestamp + 86400 * days;
};

describe("SponsorshipEscrow contract", async () => {
  const STABLECOIN_NAME: string = "TEST";
  const STABLECOIN_DECIMALS: number = 6;
  const CURRENCY_BALANCE: BigNumber = ethers.utils.parseEther("1000000000");
  const TEST_REQUESTED_AMOUNT: BigNumber = BigNumber.from("200000000"); // 200 USDC
  const TEST_DEPOSIT_AMOUNT: BigNumber = BigNumber.from("15000000"); // 15 USDC
  const TEST_SPONSORSHIP_ID: BigNumber = ethers.constants.Zero;
  const TEST_INEXISTENT_SPONSORSHIP_ID: BigNumber = BigNumber.from(9999999);
  const TEST_DAYS_TO_DEADLINE: number = 10;

  let currencyContract: ERC20PresetFixedSupply;
  let escrowContract: SponsorshipEscrow;

  let beneficiary: SignerWithAddress;
  let escrowOwner: SignerWithAddress;
  let currencyOwner: SignerWithAddress;
  let sponsor: SignerWithAddress;

  let authExpiration: number;

  const testSignature = async () => {
    const nonce: Uint8Array = ethers.utils.randomBytes(32);

    const { v, r, s } = await signAuthorization(sponsor, currencyContract, {
      from: sponsor.address,
      to: escrowContract.address,
      value: TEST_DEPOSIT_AMOUNT,
      validAfter: 0,
      validBefore: authExpiration,
      nonce: nonce,
    });

    return { v, r, s, nonce };
  };

  beforeEach(async () => {
    [beneficiary, escrowOwner, currencyOwner, sponsor] =
      await ethers.getSigners();

    const currencyFactory: ERC20PresetFixedSupply__factory =
      await ethers.getContractFactory("ERC20PresetFixedSupply", currencyOwner);
    currencyContract = await currencyFactory.deploy(
      STABLECOIN_NAME,
      STABLECOIN_NAME,
      CURRENCY_BALANCE,
      sponsor.address,
      STABLECOIN_DECIMALS
    );
    await currencyContract.deployed();

    const escrowFactory: SponsorshipEscrow__factory =
      await ethers.getContractFactory("SponsorshipEscrow", escrowOwner);

    escrowContract = await escrowFactory.deploy(currencyContract.address);
    await escrowContract.deployed();

    authExpiration = await daysFromBlock(1);
  });

  describe("registerSponsortship", async () => {
    it("Should register sponsorship successfully", async () => {
      expect(
        await escrowContract.callStatic.registerSponsortship(
          TEST_REQUESTED_AMOUNT,
          await daysFromBlock(TEST_DAYS_TO_DEADLINE),
          beneficiary.address
        )
      ).to.equals(0);

      await expect(
        escrowContract.registerSponsortship(
          TEST_REQUESTED_AMOUNT,
          await daysFromBlock(TEST_DAYS_TO_DEADLINE),
          beneficiary.address
        )
      ).to.not.be.reverted;

      expect(
        await escrowContract.callStatic.registerSponsortship(
          TEST_REQUESTED_AMOUNT,
          await daysFromBlock(TEST_DAYS_TO_DEADLINE),
          beneficiary.address
        )
      ).to.equals(1);
    });

    it("Should fail due to not having ownership of contract", async () => {
      await expect(
        escrowContract
          .connect(beneficiary)
          .registerSponsortship(
            TEST_REQUESTED_AMOUNT,
            await daysFromBlock(TEST_DAYS_TO_DEADLINE),
            beneficiary.address
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail due to deadline being too soon", async () => {
      await expect(
        escrowContract.registerSponsortship(
          TEST_REQUESTED_AMOUNT,
          await daysFromBlock(5),
          beneficiary.address
        )
      ).to.be.revertedWith(
        "SponsorshipEscrow: deadline ends in less than 604800 seconds"
      );
    });

    it("Should fail due to setting beneficiary to zero address", async () => {
      await expect(
        escrowContract.registerSponsortship(
          TEST_REQUESTED_AMOUNT,
          await daysFromBlock(TEST_DAYS_TO_DEADLINE),
          ethers.constants.AddressZero
        )
      ).to.be.revertedWith("SponsorshipEscrow: zero address beneficiary");
    });
  });

  describe("cancel", async () => {
    beforeEach(async () => {
      await escrowContract.registerSponsortship(
        TEST_REQUESTED_AMOUNT,
        await daysFromBlock(TEST_DAYS_TO_DEADLINE),
        beneficiary.address
      );
    });

    it("Should cancel the sponsorship and emit the Cancel event", async () => {
      await expect(escrowContract.cancel(TEST_SPONSORSHIP_ID))
        .to.emit(escrowContract, "Cancel")
        .withArgs(TEST_SPONSORSHIP_ID);
    });

    it("Should fail due to caller not being owner", async () => {
      await expect(
        escrowContract.connect(sponsor).cancel(TEST_SPONSORSHIP_ID)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail due to inexistend sponsorship", async () => {
      await expect(
        escrowContract.cancel(TEST_INEXISTENT_SPONSORSHIP_ID)
      ).to.be.revertedWith("SponsorshipEscrow: sponsorship id does not exits");
    });

    it("Should fail due to sponsorship already inactive", async () => {
      await escrowContract.cancel(TEST_SPONSORSHIP_ID);
      await expect(
        escrowContract.cancel(TEST_SPONSORSHIP_ID)
      ).to.be.revertedWith("SponsorshipEscrow: sponsorship already inactive");
    });
  });

  describe("deposit", async () => {
    beforeEach(async () => {
      await escrowContract.registerSponsortship(
        TEST_REQUESTED_AMOUNT,
        await daysFromBlock(TEST_DAYS_TO_DEADLINE),
        beneficiary.address
      );
    });

    it("Should make successful deposit and emit Deposit event", async () => {
      const { v, r, s, nonce } = await testSignature();

      await expect(
        escrowContract
          .connect(sponsor)
          .deposit(
            TEST_SPONSORSHIP_ID,
            TEST_DEPOSIT_AMOUNT,
            nonce,
            authExpiration,
            v,
            r,
            s
          )
      )
        .to.emit(escrowContract, "Deposit")
        .withArgs(
          TEST_SPONSORSHIP_ID,
          sponsor.address,
          TEST_DEPOSIT_AMOUNT,
          TEST_DEPOSIT_AMOUNT
        );
    });

    it("Should be able to receive multiple deposits from same sponsor", async () => {
      const { v: v1, r: r1, s: s1, nonce: nonce1 } = await testSignature();
      await escrowContract
        .connect(sponsor)
        .deposit(
          TEST_SPONSORSHIP_ID,
          TEST_DEPOSIT_AMOUNT,
          nonce1,
          authExpiration,
          v1,
          r1,
          s1
        );

      const { v: v2, r: r2, s: s2, nonce: nonce2 } = await testSignature();
      await expect(
        escrowContract
          .connect(sponsor)
          .deposit(
            TEST_SPONSORSHIP_ID,
            TEST_DEPOSIT_AMOUNT,
            nonce2,
            authExpiration,
            v2,
            r2,
            s2
          )
      )
        .to.emit(escrowContract, "Deposit")
        .withArgs(
          TEST_SPONSORSHIP_ID,
          sponsor.address,
          TEST_DEPOSIT_AMOUNT,
          TEST_DEPOSIT_AMOUNT.add(TEST_DEPOSIT_AMOUNT)
        );
    });

    it("Should make successful deposit and reflect balance", async () => {
      const { v, r, s, nonce } = await testSignature();

      await escrowContract
        .connect(sponsor)
        .deposit(
          TEST_SPONSORSHIP_ID,
          TEST_DEPOSIT_AMOUNT,
          nonce,
          authExpiration,
          v,
          r,
          s
        );

      expect(
        await currencyContract.balanceOf(escrowContract.address)
      ).to.deep.equals(TEST_DEPOSIT_AMOUNT);
    });

    it("Should fail due to inexistent sponsorship", async () => {
      const { v, r, s, nonce } = await testSignature();

      await expect(
        escrowContract
          .connect(sponsor)
          .deposit(
            TEST_INEXISTENT_SPONSORSHIP_ID,
            TEST_DEPOSIT_AMOUNT,
            nonce,
            authExpiration,
            v,
            r,
            s
          )
      ).to.be.revertedWith("SponsorshipEscrow: sponsorship id does not exits");
    });

    it("Should fail due to expired sponsorship", async () => {
      await network.provider.send("evm_setNextBlockTimestamp", [
        await daysFromBlock(TEST_DAYS_TO_DEADLINE),
      ]);
      const { v, r, s, nonce } = await testSignature();

      await expect(
        escrowContract
          .connect(sponsor)
          .deposit(
            TEST_SPONSORSHIP_ID,
            TEST_DEPOSIT_AMOUNT,
            nonce,
            authExpiration,
            v,
            r,
            s
          )
      ).to.be.revertedWith("SponsorshipEscrow: sponsorship expired");
    });

    it("Should fail due to sponsorship being inactive", async () => {
      const { v, r, s, nonce } = await testSignature();

      await escrowContract.cancel(TEST_SPONSORSHIP_ID);

      await expect(
        escrowContract
          .connect(sponsor)
          .deposit(
            TEST_SPONSORSHIP_ID,
            TEST_DEPOSIT_AMOUNT,
            nonce,
            authExpiration,
            v,
            r,
            s
          )
      ).to.be.revertedWith("SponsorshipEscrow: sponsorship not active");
    });

    it("Should fail due to zero value deposit", async () => {
      const { v, r, s, nonce } = await testSignature();

      await expect(
        escrowContract
          .connect(sponsor)
          .deposit(
            TEST_SPONSORSHIP_ID,
            ethers.constants.Zero,
            nonce,
            authExpiration,
            v,
            r,
            s
          )
      ).to.be.revertedWith("SponsorshipEscrow: zero mount deposit");
    });
  });

  describe("refund", async () => {
    const SPONSORSHIP_ID_EXPIRED_FULLFILLED: number = 0;
    const SPONSORSHIP_ID_EXPIRED_UNFULLFILLED: number = 1;
    const SPONSORSHIP_ID_FULFILLED: number = 2;
    const SPONSORSHIP_ID_UNFULFILLED: number = 3;
    const SPONSORSHIP_ID_INACTIVE: number = 4;

    const createTestSponsorshipAndDeposits = async (
      amountDeposited: BigNumber
    ) => {
      await escrowContract.registerSponsortship(
        TEST_REQUESTED_AMOUNT,
        await daysFromBlock(TEST_DAYS_TO_DEADLINE),
        beneficiary.address
      );

      const nonce: Uint8Array = ethers.utils.randomBytes(32);

      const { v, r, s } = await signAuthorization(sponsor, currencyContract, {
        from: sponsor.address,
        to: escrowContract.address,
        value: amountDeposited,
        validAfter: 0,
        validBefore: authExpiration,
        nonce: nonce,
      });

      await escrowContract
        .connect(sponsor)
        .deposit(
          TEST_SPONSORSHIP_ID,
          amountDeposited,
          nonce,
          authExpiration,
          v,
          r,
          s
        );
    };

    beforeEach(async () => {
      // SPONSORSHIP_ID_EXPIRED_FULLFILLED
      await createTestSponsorshipAndDeposits(TEST_REQUESTED_AMOUNT);
      // SPONSORSHIP_ID_EXPIRED_UNFULLFILLED
      await createTestSponsorshipAndDeposits(TEST_DEPOSIT_AMOUNT);
      await network.provider.send("evm_setNextBlockTimestamp", [
        await daysFromBlock(TEST_DAYS_TO_DEADLINE),
      ]);

      // SPONSORSHIP_ID_FULFILLED
      await createTestSponsorshipAndDeposits(TEST_REQUESTED_AMOUNT);
      // SPONSORSHIP_ID_UNFULFILLED
      await createTestSponsorshipAndDeposits(TEST_DEPOSIT_AMOUNT);
      //SPONSORSHIP_ID_INACTIVE
      await createTestSponsorshipAndDeposits(TEST_DEPOSIT_AMOUNT);
      await escrowContract.cancel(SPONSORSHIP_ID_INACTIVE);
    });
  });
});
