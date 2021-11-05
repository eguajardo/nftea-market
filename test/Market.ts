import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TransactionResponse } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import {
  signAuthorization,
  daysFromBlock,
  initializeCurrencyContract,
  fiatToStablecoin,
} from "./utils/testUtils";

import {
  Market,
  MultiToken,
  MultiToken__factory,
  ERC20PresetFixedSupply,
  Market__factory,
  PaymentSplitter,
  PaymentSplitter__factory,
  SponsorshipEscrow,
  SponsorshipEscrow__factory,
} from "../typechain";

describe("Market contract", () => {
  const STALL_NAME_REGISTERED: string = "testStallName1";
  const STALL_NAME_UNREGISTERED: string = "testStallName2";
  const TEST_URI_1: string = "testURI1";
  const TEST_URI_2: string = "testURI2";
  const TEST_SUPPLY_1: number = 10;
  const TEST_PRICE_FIAT: number = 100;
  const ACCOUNT_BALANCE: BigNumber = BigNumber.from("200000000"); // 200 USDC
  const TEST_SPONSOR_SHARES: BigNumber = BigNumber.from(750); // %7.25
  const TEST_REQUESTED_AMOUNT: BigNumber = BigNumber.from("25201"); // 252.01 USD
  const TEST_DAYS_TO_DEADLINE: number = 10;
  const TEST_SPONSORSHIP_ID: BigNumber = ethers.constants.Zero;

  let marketContract: Market;
  let nftContract: MultiToken;
  let currencyContract: ERC20PresetFixedSupply;

  let defaultSigner: SignerWithAddress;
  let vendor: SignerWithAddress;
  let buyer: SignerWithAddress;
  let sponsor1: SignerWithAddress;
  let sponsor2: SignerWithAddress;
  let sponsor3: SignerWithAddress;
  let sponsor4: SignerWithAddress;
  let sponsor5: SignerWithAddress;

  beforeEach(async () => {
    [
      defaultSigner,
      vendor,
      buyer,
      sponsor1,
      sponsor2,
      sponsor3,
      sponsor4,
      sponsor5,
    ] = await ethers.getSigners();

    currencyContract = await initializeCurrencyContract(ACCOUNT_BALANCE, [
      buyer,
      sponsor1,
      sponsor2,
      sponsor3,
      sponsor4,
      sponsor5,
    ]);

    const marketFactory: Market__factory = await ethers.getContractFactory(
      "Market",
      defaultSigner
    );
    marketContract = await marketFactory.deploy(
      currencyContract.address,
      await currencyContract.decimals()
    );
    await marketContract.deployed();

    const tokenFactory: MultiToken__factory = await ethers.getContractFactory(
      "MultiToken"
    );
    nftContract = tokenFactory.attach(await marketContract.nftContract());

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
        .withArgs(defaultSigner.address, STALL_NAME_UNREGISTERED, TEST_URI_2);
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

  describe("postNFTForSale", async () => {
    it("Should emit ClassRegistration when posting token for sale", async () => {
      const REGISTERED_CLASS: number = 1;

      await expect(
        marketContract
          .connect(vendor)
          .postNFTForSale(TEST_URI_1, TEST_SUPPLY_1, TEST_PRICE_FIAT)
      )
        .to.emit(nftContract, "ClassRegistration")
        .withArgs(REGISTERED_CLASS, TEST_URI_1, TEST_SUPPLY_1);
    });

    it("Should fail due to unregistered vendor", async () => {
      await expect(
        marketContract.postNFTForSale(
          TEST_URI_1,
          TEST_SUPPLY_1,
          TEST_PRICE_FIAT
        )
      ).to.be.revertedWith("Market: account is not a registered vendor");
    });

    it("Should fail due to under price", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .postNFTForSale(TEST_URI_1, TEST_SUPPLY_1, ethers.constants.Zero)
      ).to.be.revertedWith("Market: price less than 100 cents");
    });
  });

  describe("buyNFT", async () => {
    const TEST_PRICE_STABLECOIN: BigNumber = fiatToStablecoin(TEST_PRICE_FIAT);
    const NFT_FOR_SALE: number = 1;
    const NFT_FOR_SALE_BASE_ID: BigNumber = BigNumber.from(
      "340282366920938463463374607431768211456"
    );
    const NFT_NEXT_SERIAL: number = 1;
    const PLATFORM_COMISSION: number = 0.05;

    let authExpiration: number;
    let registeredStallPaymentSplitter: PaymentSplitter;

    const testSignature = async () => {
      const nonce: Uint8Array = ethers.utils.randomBytes(32);

      const { v, r, s } = await signAuthorization(buyer, currencyContract, {
        from: buyer.address,
        to: await marketContract.paymentAddress(NFT_FOR_SALE),
        value: TEST_PRICE_STABLECOIN,
        validAfter: 0,
        validBefore: authExpiration,
        nonce: nonce,
      });

      return { v, r, s, nonce };
    };

    beforeEach(async () => {
      await marketContract
        .connect(vendor)
        .postNFTForSale(TEST_URI_1, TEST_SUPPLY_1, TEST_PRICE_FIAT);

      const blockNumber: number = await ethers.provider.getBlockNumber();
      const timestamp: number = (await ethers.provider.getBlock(blockNumber))
        .timestamp;
      authExpiration = timestamp + 300; // 5 min from block timestamp

      const splitterFactory: PaymentSplitter__factory =
        await ethers.getContractFactory("PaymentSplitter");
      registeredStallPaymentSplitter = splitterFactory.attach(
        await marketContract.paymentAddress(NFT_FOR_SALE)
      );
    });

    it("Test stablecoin contract should transfer with authorization", async () => {
      const { v, r, s, nonce } = await testSignature();

      await currencyContract.transferWithAuthorization(
        buyer.address,
        registeredStallPaymentSplitter.address,
        TEST_PRICE_STABLECOIN,
        0,
        authExpiration,
        nonce,
        v,
        r,
        s
      );

      expect(
        await currencyContract.balanceOf(registeredStallPaymentSplitter.address)
      ).to.equals(TEST_PRICE_STABLECOIN);
    });

    it("Test stablecoin contract should fail with invalid signature", async () => {
      const { v, r, s, nonce } = await testSignature();

      await expect(
        currencyContract.transferWithAuthorization(
          buyer.address,
          defaultSigner.address,
          TEST_PRICE_STABLECOIN,
          0,
          authExpiration,
          nonce,
          v,
          r,
          s
        )
      ).to.be.revertedWith("FiatTokenV2: invalid signature");
    });

    it("Should emit NFTPurchase event", async () => {
      const { v, r, s, nonce } = await testSignature();

      await expect(
        marketContract
          .connect(buyer)
          .buyNFT(NFT_FOR_SALE, nonce, authExpiration, v, r, s)
      )
        .to.emit(marketContract, "NFTPurchase")
        .withArgs(
          buyer.address,
          NFT_FOR_SALE,
          STALL_NAME_REGISTERED,
          NFT_FOR_SALE_BASE_ID.add(NFT_NEXT_SERIAL),
          TEST_PRICE_FIAT
        );
    });

    it("Should update payment splitter balance", async () => {
      const { v, r, s, nonce } = await testSignature();

      await marketContract
        .connect(buyer)
        .buyNFT(NFT_FOR_SALE, nonce, authExpiration, v, r, s);

      expect(
        await currencyContract.balanceOf(registeredStallPaymentSplitter.address)
      ).to.equals(TEST_PRICE_STABLECOIN);
    });

    it("Should update buyer's currency balance", async () => {
      const { v, r, s, nonce } = await testSignature();

      await marketContract
        .connect(buyer)
        .buyNFT(NFT_FOR_SALE, nonce, authExpiration, v, r, s);

      expect(await currencyContract.balanceOf(buyer.address)).to.equals(
        ACCOUNT_BALANCE.sub(TEST_PRICE_STABLECOIN)
      );
    });

    it("Should update buyer's NFT balance", async () => {
      const { v, r, s, nonce } = await testSignature();

      await marketContract
        .connect(buyer)
        .buyNFT(NFT_FOR_SALE, nonce, authExpiration, v, r, s);

      expect(
        await nftContract.balanceOf(
          buyer.address,
          NFT_FOR_SALE_BASE_ID.add(NFT_NEXT_SERIAL)
        )
      ).to.equals(ethers.constants.One);
    });

    it("Should split funds after release", async () => {
      const { v, r, s, nonce } = await testSignature();

      await marketContract
        .connect(buyer)
        .buyNFT(NFT_FOR_SALE, nonce, authExpiration, v, r, s);

      // Accessing function using braces because of typescript
      // function overloading limitations
      registeredStallPaymentSplitter["release(address,address)"](
        currencyContract.address,
        marketContract.address
      );

      registeredStallPaymentSplitter["release(address,address)"](
        currencyContract.address,
        vendor.address
      );

      const vendorBalance: number = (
        await currencyContract.balanceOf(vendor.address)
      ).toNumber();
      const marketBalance: number = (
        await currencyContract.balanceOf(marketContract.address)
      ).toNumber();

      expect(vendorBalance).to.equals(
        TEST_PRICE_STABLECOIN.toNumber() * (1 - PLATFORM_COMISSION)
      );
      expect(marketBalance).to.equals(
        TEST_PRICE_STABLECOIN.toNumber() * PLATFORM_COMISSION
      );
    });

    it("Should fail due to inexistent NFT class", async () => {
      const { v, r, s, nonce } = await testSignature();

      await expect(
        marketContract
          .connect(buyer)
          .buyNFT(NFT_FOR_SALE + 1, nonce, authExpiration, v, r, s)
      ).to.be.revertedWith("Market: unregistered NFT class");
    });

    it("Should fail due to invalid signature", async () => {
      const { v, r, s, nonce } = await testSignature();

      await expect(
        marketContract
          .connect(buyer)
          .buyNFT(NFT_FOR_SALE, nonce, authExpiration + 1, v, r, s)
      ).to.be.revertedWith("FiatTokenV2: invalid signature");
    });

    it("Should fail due to not enough funds", async () => {
      await currencyContract
        .connect(buyer)
        .transfer(defaultSigner.address, ACCOUNT_BALANCE);

      const { v, r, s, nonce } = await testSignature();

      await expect(
        marketContract
          .connect(buyer)
          .buyNFT(NFT_FOR_SALE, nonce, authExpiration, v, r, s)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should fail due to expired authorization", async () => {
      await network.provider.send("evm_setNextBlockTimestamp", [
        authExpiration,
      ]);

      const { v, r, s, nonce } = await testSignature();

      await expect(
        marketContract
          .connect(buyer)
          .buyNFT(NFT_FOR_SALE, nonce, authExpiration, v, r, s)
      ).to.be.revertedWith("FiatTokenV2: authorization is expired");
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

  describe("stallNFTs", async () => {
    it("Should return empty array", async () => {
      expect(await marketContract.stallNFTs(STALL_NAME_REGISTERED)).to.be.empty;
    });

    it("Should return list of tokens for sale in stall", async () => {
      const classes: Array<BigNumber> = [];

      for (let i = 0; i < 10; i++) {
        await marketContract
          .connect(vendor)
          .postNFTForSale(TEST_URI_1, TEST_SUPPLY_1, TEST_PRICE_FIAT);

        classes.push(BigNumber.from(i + 1));
      }

      expect(
        await marketContract.stallNFTs(STALL_NAME_REGISTERED)
      ).to.deep.equal(classes);
    });

    it("Should fail due to unregistered stall name", async () => {
      await expect(
        marketContract.stallNFTs(STALL_NAME_UNREGISTERED)
      ).to.be.revertedWith("Market: unregistered stall name");
    });
  });

  describe("nftData", async () => {
    const TEST_BASE_ID: BigNumber = BigNumber.from(
      "340282366920938463463374607431768211456"
    );

    it("Should return the NFT data", async () => {
      await marketContract
        .connect(vendor)
        .postNFTForSale(TEST_URI_1, TEST_SUPPLY_1, TEST_PRICE_FIAT);

      const nftData = await marketContract.nftData(TEST_BASE_ID);

      expect(nftData.uri).to.equals(TEST_URI_1);
      expect(nftData.maxSupply).to.deep.equals(TEST_SUPPLY_1);
      expect(nftData.price).to.deep.equals(TEST_PRICE_FIAT);
      expect(nftData.class).to.deep.equals(ethers.constants.One);
      expect(nftData.serial).to.deep.equals(ethers.constants.Zero);
      expect(nftData.stallName).to.equals(STALL_NAME_REGISTERED);
    });

    it("Should fail due to unregistered class", async () => {
      await expect(marketContract.nftData(TEST_BASE_ID)).to.be.revertedWith(
        "Market: unregistered NFT class"
      );
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
        marketContract.vendorStallName(defaultSigner.address)
      ).to.be.revertedWith("Market: account does not own a stall");
    });
  });

  describe("uriOrEmpty", async () => {
    it("Should get correct URI", async () => {
      expect(await marketContract.uriOrEmpty(vendor.address)).to.equals(
        TEST_URI_1
      );
    });

    it("Should get empty URI", async () => {
      expect(await marketContract.uriOrEmpty(defaultSigner.address)).to.be
        .empty;
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

  describe("requestSponsorship", async () => {
    let deadline: number;

    beforeEach(async () => {
      deadline = await daysFromBlock(TEST_DAYS_TO_DEADLINE);
    });

    it("Should emit Sponsorship event", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .requestSponsorship(
            TEST_SUPPLY_1,
            TEST_PRICE_FIAT,
            TEST_SPONSOR_SHARES,
            TEST_URI_1,
            TEST_REQUESTED_AMOUNT,
            deadline
          )
      )
        .to.emit(marketContract, "Sponsorship")
        .withArgs(
          TEST_SPONSORSHIP_ID,
          STALL_NAME_REGISTERED,
          TEST_SUPPLY_1,
          TEST_PRICE_FIAT,
          TEST_SPONSOR_SHARES,
          TEST_URI_1,
          TEST_REQUESTED_AMOUNT,
          deadline
        );
    });

    it("Should fail due to requester not being a vendor", async () => {
      await expect(
        marketContract.requestSponsorship(
          TEST_SUPPLY_1,
          TEST_PRICE_FIAT,
          TEST_SPONSOR_SHARES,
          TEST_URI_1,
          TEST_REQUESTED_AMOUNT,
          deadline
        )
      ).to.be.revertedWith("Market: account is not a registered vendor");
    });

    it("Should fail due to invalid NFT price", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .requestSponsorship(
            TEST_SUPPLY_1,
            ethers.constants.Zero,
            TEST_SPONSOR_SHARES,
            TEST_URI_1,
            TEST_REQUESTED_AMOUNT,
            deadline
          )
      ).to.be.revertedWith("Market: price less than 100 cents");
    });

    it("Should fail due to empty URI", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .requestSponsorship(
            TEST_SUPPLY_1,
            TEST_PRICE_FIAT,
            TEST_SPONSOR_SHARES,
            "",
            TEST_REQUESTED_AMOUNT,
            deadline
          )
      ).to.be.revertedWith("Market: URI cannot be empty");
    });

    it("Should fail due to zero sponsor shares", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .requestSponsorship(
            TEST_SUPPLY_1,
            TEST_PRICE_FIAT,
            ethers.constants.Zero,
            TEST_URI_1,
            TEST_REQUESTED_AMOUNT,
            deadline
          )
      ).to.be.revertedWith("Market: zero sponsor shares");
    });

    it("Should fail due to shares exceeding maximum", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .requestSponsorship(
            TEST_SUPPLY_1,
            TEST_PRICE_FIAT,
            BigNumber.from(9499),
            TEST_URI_1,
            TEST_REQUESTED_AMOUNT,
            deadline
          )
      ).to.not.be.reverted;

      await expect(
        marketContract
          .connect(vendor)
          .requestSponsorship(
            TEST_SUPPLY_1,
            TEST_PRICE_FIAT,
            BigNumber.from(9500),
            TEST_URI_1,
            TEST_REQUESTED_AMOUNT,
            deadline
          )
      ).to.be.revertedWith(
        "Market: sponsor shares + platform shares exceeds maximum"
      );
    });
  });

  describe("postSponsoredNFTForSale", async () => {
    let escrowContract: SponsorshipEscrow;
    let expectedTotalFunds: BigNumber;

    let expectedDeposits: Array<BigNumber>;
    let expectedSponsors: Array<SignerWithAddress>;

    const createTestDeposit = async (
      depositAmount: BigNumber,
      sponsorshipId: BigNumber,
      contributor: SignerWithAddress
    ) => {
      const authExpiration = await daysFromBlock(1);
      const nonce: Uint8Array = ethers.utils.randomBytes(32);

      const { v, r, s } = await signAuthorization(
        contributor,
        currencyContract,
        {
          from: contributor.address,
          to: escrowContract.address,
          value: depositAmount,
          validAfter: 0,
          validBefore: authExpiration,
          nonce: nonce,
        }
      );

      await escrowContract
        .connect(contributor)
        .deposit(sponsorshipId, depositAmount, nonce, authExpiration, v, r, s);
    };

    beforeEach(async () => {
      expectedDeposits = [
        BigNumber.from("100000000"),
        BigNumber.from("50000000"),
        BigNumber.from("50000000"),
        BigNumber.from("50005000"),
        BigNumber.from("2005000"),
      ];
      expectedSponsors = [sponsor1, sponsor2, sponsor3, sponsor4, sponsor5];

      const escrowFactory: SponsorshipEscrow__factory =
        await ethers.getContractFactory("SponsorshipEscrow");
      escrowContract = escrowFactory.attach(await marketContract.escrow());

      await marketContract
        .connect(vendor)
        .requestSponsorship(
          TEST_SUPPLY_1,
          TEST_PRICE_FIAT,
          TEST_SPONSOR_SHARES,
          TEST_URI_1,
          TEST_REQUESTED_AMOUNT,
          await daysFromBlock(TEST_DAYS_TO_DEADLINE)
        );

      await marketContract
        .connect(vendor)
        .requestSponsorship(
          TEST_SUPPLY_1,
          TEST_PRICE_FIAT,
          TEST_SPONSOR_SHARES,
          TEST_URI_1,
          TEST_REQUESTED_AMOUNT,
          await daysFromBlock(TEST_DAYS_TO_DEADLINE)
        );

      expectedTotalFunds = ethers.constants.Zero;
      for (let i = 0; i < expectedDeposits.length; i++) {
        expectedTotalFunds = expectedTotalFunds.add(expectedDeposits[i]);
        await createTestDeposit(
          expectedDeposits[i],
          TEST_SPONSORSHIP_ID,
          expectedSponsors[i]
        );
      }
    });

    it("Should emit SponsorshipComplete event", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .postSponsoredNFTForSale(TEST_SPONSORSHIP_ID, TEST_URI_1)
      )
        .to.emit(escrowContract, "SponsorshipComplete")
        .withArgs(TEST_SPONSORSHIP_ID, expectedTotalFunds);
    });

    it("Should emit NFTForSale event", async () => {
      const REGISTERED_CLASS: number = 1;

      await expect(
        marketContract
          .connect(vendor)
          .postSponsoredNFTForSale(TEST_SPONSORSHIP_ID, TEST_URI_1)
      )
        .to.emit(marketContract, "NFTForSale")
        .withArgs(
          STALL_NAME_REGISTERED,
          vendor.address,
          TEST_PRICE_FIAT,
          REGISTERED_CLASS,
          TEST_SUPPLY_1
        );
    });

    it("Should fail due to caller not registered vendor", async () => {
      await expect(
        marketContract.postSponsoredNFTForSale(TEST_SPONSORSHIP_ID, TEST_URI_1)
      ).to.be.revertedWith("Market: account is not a registered vendor");
    });

    it("Should fail due to sponsorshipt not being registered to vendor", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .postSponsoredNFTForSale(TEST_SPONSORSHIP_ID.add(2), TEST_URI_1)
      ).to.be.revertedWith("Market: sponsorship not registered to stall");
    });

    it("Should fail due to sponsorshipt not being registered to vendor", async () => {
      await expect(
        marketContract
          .connect(vendor)
          .postSponsoredNFTForSale(TEST_SPONSORSHIP_ID.add(1), TEST_URI_1)
      ).to.be.revertedWith("SponsorshipEscrow: requested amount not raised");
    });

    it("Should have correct shares", async () => {
      const REGISTERED_CLASS: number = 1;
      const PAYMENT_MAX_SHARES = await marketContract.PAYMENT_MAX_SHARES();
      const PLATFORM_COMISSION_SHARES =
        await marketContract.PLATFORM_COMISSION_SHARES();
      const VENDOR_SHARES = PAYMENT_MAX_SHARES.sub(
        PLATFORM_COMISSION_SHARES
      ).sub(TEST_SPONSOR_SHARES);

      const expectedTotalShares: BigNumber =
        expectedTotalFunds.mul(PAYMENT_MAX_SHARES);
      const expectedMarketShares: BigNumber = expectedTotalFunds.mul(
        PLATFORM_COMISSION_SHARES
      );
      const expectedVendorShares: BigNumber =
        expectedTotalFunds.mul(VENDOR_SHARES);

      await marketContract
        .connect(vendor)
        .postSponsoredNFTForSale(TEST_SPONSORSHIP_ID, TEST_URI_1);

      const splitterFactory: PaymentSplitter__factory =
        await ethers.getContractFactory("PaymentSplitter");
      const paymentSplitter = splitterFactory.attach(
        await marketContract.paymentAddress(REGISTERED_CLASS)
      );

      const marketShares = await paymentSplitter.shares(marketContract.address);
      const vendorShares = await paymentSplitter.shares(vendor.address);

      let sponsorsShares: BigNumber = ethers.constants.Zero;
      for (let i = 0; i < expectedSponsors.length; i++) {
        const shares = await paymentSplitter.shares(
          expectedSponsors[i].address
        );
        sponsorsShares = sponsorsShares.add(shares);

        expect(shares).to.deep.equals(
          expectedDeposits[i].mul(TEST_SPONSOR_SHARES)
        );
      }

      let totalShares = marketShares.add(vendorShares).add(sponsorsShares);

      expect(await paymentSplitter.totalShares()).to.deep.equals(totalShares);
      expect(totalShares).to.deep.equals(expectedTotalShares);
      expect(marketShares).to.deep.equals(expectedMarketShares);
      expect(vendorShares).to.deep.equals(expectedVendorShares);
      expect(totalShares.div(marketShares)).to.deep.equals(
        PAYMENT_MAX_SHARES.div(PLATFORM_COMISSION_SHARES)
      );
      expect(totalShares.div(vendorShares)).to.deep.equals(
        PAYMENT_MAX_SHARES.div(VENDOR_SHARES)
      );
      expect(totalShares.div(sponsorsShares)).to.deep.equals(
        PAYMENT_MAX_SHARES.div(TEST_SPONSOR_SHARES)
      );
    });
  });
});
