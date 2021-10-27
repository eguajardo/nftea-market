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
  const CURRENCY_SUPPLY: BigNumber = ethers.utils.parseEther("1000000000");
  const ACOUNT_BALANCE: BigNumber = ethers.utils.parseEther("200000000");
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
  let sponsor1: SignerWithAddress;
  let sponsor2: SignerWithAddress;
  let sponsor3: SignerWithAddress;
  let sponsor4: SignerWithAddress;
  let sponsor5: SignerWithAddress;

  let authExpiration: number;

  const testSignature = async () => {
    const nonce: Uint8Array = ethers.utils.randomBytes(32);

    const { v, r, s } = await signAuthorization(sponsor1, currencyContract, {
      from: sponsor1.address,
      to: escrowContract.address,
      value: TEST_DEPOSIT_AMOUNT,
      validAfter: 0,
      validBefore: authExpiration,
      nonce: nonce,
    });

    return { v, r, s, nonce };
  };

  const createTestSponsorship = async (): Promise<BigNumber> => {
    const sponsorshipId: BigNumber =
      await escrowContract.callStatic.registerSponsortship(
        TEST_REQUESTED_AMOUNT,
        await daysFromBlock(TEST_DAYS_TO_DEADLINE),
        beneficiary.address
      );

    await escrowContract.registerSponsortship(
      TEST_REQUESTED_AMOUNT,
      await daysFromBlock(TEST_DAYS_TO_DEADLINE),
      beneficiary.address
    );

    return sponsorshipId;
  };

  const createTestDeposit = async (
    depositAmount: BigNumber,
    sponsorshipId: BigNumber,
    contributor: SignerWithAddress
  ) => {
    const nonce: Uint8Array = ethers.utils.randomBytes(32);

    const { v, r, s } = await signAuthorization(contributor, currencyContract, {
      from: contributor.address,
      to: escrowContract.address,
      value: depositAmount,
      validAfter: 0,
      validBefore: authExpiration,
      nonce: nonce,
    });

    await escrowContract
      .connect(contributor)
      .deposit(sponsorshipId, depositAmount, nonce, authExpiration, v, r, s);
  };

  const createTestSponsorshipAndDeposits = async (depositAmount: BigNumber) => {
    const sponsorshipId: BigNumber = await createTestSponsorship();

    await createTestDeposit(depositAmount, sponsorshipId, sponsor1);
  };

  beforeEach(async () => {
    [
      beneficiary,
      escrowOwner,
      currencyOwner,
      sponsor1,
      sponsor2,
      sponsor3,
      sponsor4,
      sponsor5,
    ] = await ethers.getSigners();

    const currencyFactory: ERC20PresetFixedSupply__factory =
      await ethers.getContractFactory("ERC20PresetFixedSupply", currencyOwner);
    currencyContract = await currencyFactory.deploy(
      STABLECOIN_NAME,
      STABLECOIN_NAME,
      CURRENCY_SUPPLY,
      currencyOwner.address,
      STABLECOIN_DECIMALS
    );
    await currencyContract.deployed();

    const escrowFactory: SponsorshipEscrow__factory =
      await ethers.getContractFactory("SponsorshipEscrow", escrowOwner);

    escrowContract = await escrowFactory.deploy(currencyContract.address);
    await escrowContract.deployed();

    authExpiration = await daysFromBlock(1);

    await currencyContract.transfer(sponsor1.address, ACOUNT_BALANCE);
    await currencyContract.transfer(sponsor2.address, ACOUNT_BALANCE);
    await currencyContract.transfer(sponsor3.address, ACOUNT_BALANCE);
    await currencyContract.transfer(sponsor4.address, ACOUNT_BALANCE);
    await currencyContract.transfer(sponsor5.address, ACOUNT_BALANCE);
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
        escrowContract.connect(sponsor1).cancel(TEST_SPONSORSHIP_ID)
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
          .connect(sponsor1)
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
          sponsor1.address,
          TEST_DEPOSIT_AMOUNT,
          TEST_DEPOSIT_AMOUNT
        );
    });

    it("Should be able to receive multiple deposits from same sponsor", async () => {
      const { v: v1, r: r1, s: s1, nonce: nonce1 } = await testSignature();
      await escrowContract
        .connect(sponsor1)
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
          .connect(sponsor1)
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
          sponsor1.address,
          TEST_DEPOSIT_AMOUNT,
          TEST_DEPOSIT_AMOUNT.add(TEST_DEPOSIT_AMOUNT)
        );
    });

    it("Should make successful deposit and reflect balance", async () => {
      const { v, r, s, nonce } = await testSignature();

      await escrowContract
        .connect(sponsor1)
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
          .connect(sponsor1)
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
          .connect(sponsor1)
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
          .connect(sponsor1)
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
          .connect(sponsor1)
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
    beforeEach(async () => {
      await createTestSponsorshipAndDeposits(TEST_DEPOSIT_AMOUNT);
    });

    it("Should refund and emit event Refund", async () => {
      await escrowContract.cancel(TEST_SPONSORSHIP_ID);

      await expect(
        escrowContract
          .connect(beneficiary)
          .refund(TEST_SPONSORSHIP_ID, sponsor1.address)
      )
        .to.emit(escrowContract, "Refund")
        .withArgs(TEST_SPONSORSHIP_ID, sponsor1.address, TEST_DEPOSIT_AMOUNT);
    });

    it("Should refund and update balances", async () => {
      await escrowContract.cancel(TEST_SPONSORSHIP_ID);
      await escrowContract.refund(TEST_SPONSORSHIP_ID, sponsor1.address);

      expect(await currencyContract.balanceOf(sponsor1.address)).to.deep.equals(
        ACOUNT_BALANCE
      );
    });

    it("Should fail due to double refunding", async () => {
      await escrowContract.cancel(TEST_SPONSORSHIP_ID);
      await escrowContract.refund(TEST_SPONSORSHIP_ID, sponsor1.address);
      await expect(
        escrowContract.refund(TEST_SPONSORSHIP_ID, sponsor1.address)
      ).to.be.revertedWith("SponsorshipEscrow: nothing to withdraw");
    });

    it("Should fail for not having deposits", async () => {
      await escrowContract.cancel(TEST_SPONSORSHIP_ID);
      await expect(
        escrowContract.refund(TEST_SPONSORSHIP_ID, beneficiary.address)
      ).to.be.revertedWith("SponsorshipEscrow: nothing to withdraw");
    });

    it("Should refund when expired and funds not raised", async () => {
      await network.provider.send("evm_setNextBlockTimestamp", [
        await daysFromBlock(TEST_DAYS_TO_DEADLINE),
      ]);

      await expect(escrowContract.refund(TEST_SPONSORSHIP_ID, sponsor1.address))
        .to.not.be.reverted;
    });

    it("Should fail when active and not expired", async () => {
      await expect(
        escrowContract.refund(TEST_SPONSORSHIP_ID, sponsor1.address)
      ).to.be.revertedWith(
        "SponsorshipEscrow: sponsorship active but not expired"
      );
    });

    it("Should fail when active and funds raised", async () => {
      await createTestSponsorshipAndDeposits(TEST_REQUESTED_AMOUNT);
      await network.provider.send("evm_setNextBlockTimestamp", [
        await daysFromBlock(TEST_DAYS_TO_DEADLINE),
      ]);

      await expect(
        escrowContract.refund(TEST_SPONSORSHIP_ID.add(1), sponsor1.address)
      ).to.be.revertedWith(
        "SponsorshipEscrow: sponsorship active and requested amount goal met"
      );
    });
  });

  describe("completeSponsorship", async () => {
    beforeEach(async () => {
      await createTestSponsorshipAndDeposits(TEST_REQUESTED_AMOUNT);
    });

    it("Should succeed and emit SponsorshipComplete", async () => {
      await expect(escrowContract.completeSponsorship(TEST_SPONSORSHIP_ID))
        .to.emit(escrowContract, "SponsorshipComplete")
        .withArgs(TEST_SPONSORSHIP_ID, TEST_REQUESTED_AMOUNT);
    });

    it("Should return values correctly", async () => {
      const sponsorshipId: BigNumber = await createTestSponsorship();
      const expectedDeposits = [
        BigNumber.from("100000000"),
        BigNumber.from("50000000"),
        BigNumber.from("50000000"),
        BigNumber.from("50005000"),
        BigNumber.from("2005000"),
      ];
      const expectedSponsors = [
        sponsor1,
        sponsor2,
        sponsor3,
        sponsor4,
        sponsor5,
      ];

      let expectedTotalFunds: BigNumber = ethers.constants.Zero;
      for (let i = 0; i < expectedDeposits.length; i++) {
        expectedTotalFunds = expectedTotalFunds.add(expectedDeposits[i]);
        await createTestDeposit(
          expectedDeposits[i],
          sponsorshipId,
          expectedSponsors[i]
        );
      }
      // Add an additional deposit from an already contributing sponsor
      const additionalDeposit: BigNumber = BigNumber.from("2005000");
      await createTestDeposit(additionalDeposit, sponsorshipId, sponsor1);
      expectedDeposits[0] = expectedDeposits[0].add(additionalDeposit);
      expectedTotalFunds = expectedTotalFunds.add(additionalDeposit);

      const [sponsors, deposits, totalFunds] =
        await escrowContract.callStatic.completeSponsorship(sponsorshipId);

      expect(sponsors).to.deep.equals(
        expectedSponsors.map((sponsor) => sponsor.address)
      );
      expect(deposits).to.deep.equals(expectedDeposits);
      expect(totalFunds).to.deep.equals(expectedTotalFunds);
    });

    it("Should transfer balance to beneficiary", async () => {
      await escrowContract.completeSponsorship(TEST_SPONSORSHIP_ID);

      expect(await currencyContract.balanceOf(beneficiary.address)).to.equals(
        TEST_REQUESTED_AMOUNT
      );
    });

    it("Should succeed with excedent amount", async () => {
      await createTestSponsorshipAndDeposits(
        TEST_REQUESTED_AMOUNT.add(TEST_DEPOSIT_AMOUNT)
      );

      await expect(
        escrowContract.completeSponsorship(TEST_SPONSORSHIP_ID.add(1))
      ).to.not.be.reverted;
    });

    it("Should fail due to caller not being owner", async () => {
      await expect(
        escrowContract
          .connect(beneficiary)
          .completeSponsorship(TEST_SPONSORSHIP_ID)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail due to inexistent sponsorship", async () => {
      await expect(
        escrowContract.completeSponsorship(TEST_SPONSORSHIP_ID.add(1))
      ).to.be.revertedWith("SponsorshipEscrow: sponsorship id does not exits");
    });

    it("Should fail due to inactive sponsorship", async () => {
      await escrowContract.cancel(TEST_SPONSORSHIP_ID);
      await expect(
        escrowContract.completeSponsorship(TEST_SPONSORSHIP_ID)
      ).to.be.revertedWith("SponsorshipEscrow: sponsorship not active");
    });

    it("Should due to funds not raised", async () => {
      await createTestSponsorshipAndDeposits(TEST_REQUESTED_AMOUNT.sub(1));

      await expect(
        escrowContract.completeSponsorship(TEST_SPONSORSHIP_ID.add(1))
      ).to.be.revertedWith("SponsorshipEscrow: requested amount not raised");
    });

    it("Should inactivate the sponsorship", async () => {
      await escrowContract.completeSponsorship(TEST_SPONSORSHIP_ID);
      await expect(
        escrowContract.completeSponsorship(TEST_SPONSORSHIP_ID)
      ).to.be.revertedWith("SponsorshipEscrow: sponsorship not active");
    });
  });
});
