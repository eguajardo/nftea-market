import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TransactionResponse } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { TypedDataField } from "@ethersproject/abstract-signer";

import {
  Market,
  MultiToken,
  MultiToken__factory,
  ERC20PresetFixedSupply,
  ERC20PresetFixedSupply__factory,
  Market__factory,
  PaymentSplitter,
  PaymentSplitter__factory,
} from "../typechain";

describe("Market contract", () => {
  const STABLECOIN_NAME: string = "TEST";
  const STABLECOIN_VERSION: string = "2";
  const STALL_NAME_REGISTERED: string = "testStallName1";
  const STALL_NAME_UNREGISTERED: string = "testStallName2";
  const TEST_URI_1: string = "testURI1";
  const TEST_URI_2: string = "testURI2";
  const TEST_SUPPLY_1: number = 10;
  const TEST_PRICE_FIAT: number = 100;
  const FIAT_DECIMALS: number = 2;
  const STABLECOIN_DECIMALS: number = 6;
  const CURRENCY_BALANCE: BigNumber = ethers.utils.parseEther("1000000000");

  let marketContract: Market;
  let nftContract: MultiToken;
  let currencyContract: ERC20PresetFixedSupply;

  let defaultSigner: SignerWithAddress;
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
    [defaultSigner, vendor, currencyOwner, buyer] = await ethers.getSigners();

    const currencyFactory: ERC20PresetFixedSupply__factory =
      await ethers.getContractFactory("ERC20PresetFixedSupply", currencyOwner);
    currencyContract = await currencyFactory.deploy(
      STABLECOIN_NAME,
      STABLECOIN_NAME,
      CURRENCY_BALANCE,
      buyer.address,
      STABLECOIN_DECIMALS
    );
    await currencyContract.deployed();

    const marketFactory: Market__factory = await ethers.getContractFactory(
      "Market",
      defaultSigner
    );
    marketContract = await marketFactory.deploy(
      currencyContract.address,
      STABLECOIN_DECIMALS
    );
    await marketContract.deployed();

    const tokenFactory: MultiToken__factory = await ethers.getContractFactory(
      "MultiToken"
    );
    nftContract = tokenFactory.attach(
      await marketContract.nftContractAddress()
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

    let signatureDomain: object;
    let signatureTypes: Record<string, TypedDataField[]>;
    let deadline: number;
    let registeredStallPaymentSplitter: PaymentSplitter;

    const signAuthorization = async (value: object) => {
      const signature = await buyer._signTypedData(
        signatureDomain,
        signatureTypes,
        value
      );

      const v = "0x" + signature.slice(130, 132);
      const r = signature.slice(0, 66);
      const s = "0x" + signature.slice(66, 130);

      return { v, r, s };
    };

    const testSignature = async () => {
      const nonce: Uint8Array = ethers.utils.randomBytes(32);

      const { v, r, s } = await signAuthorization({
        from: buyer.address,
        to: await marketContract.paymentAddress(NFT_FOR_SALE),
        value: TEST_PRICE_STABLECOIN,
        validAfter: 0,
        validBefore: deadline,
        nonce: nonce,
      });

      return { v, r, s, nonce };
    };

    beforeEach(async () => {
      await marketContract
        .connect(vendor)
        .postNFTForSale(TEST_URI_1, TEST_SUPPLY_1, TEST_PRICE_FIAT);

      // All properties on a domain are optional
      signatureDomain = {
        name: STABLECOIN_NAME,
        version: STABLECOIN_VERSION,
        chainId: 31337,
        verifyingContract: currencyContract.address,
      };
      // The named list of all type definitions
      signatureTypes = {
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      };

      deadline = Math.floor(Date.now() / 1000) + 300;

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
        deadline,
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
          deadline,
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
          .buyNFT(NFT_FOR_SALE, nonce, deadline, v, r, s)
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
        .buyNFT(NFT_FOR_SALE, nonce, deadline, v, r, s);

      expect(
        await currencyContract.balanceOf(registeredStallPaymentSplitter.address)
      ).to.equals(TEST_PRICE_STABLECOIN);
    });

    it("Should update buyer's currency balance", async () => {
      const { v, r, s, nonce } = await testSignature();

      await marketContract
        .connect(buyer)
        .buyNFT(NFT_FOR_SALE, nonce, deadline, v, r, s);

      expect(await currencyContract.balanceOf(buyer.address)).to.equals(
        CURRENCY_BALANCE.sub(TEST_PRICE_STABLECOIN)
      );
    });

    it("Should update buyer's NFT balance", async () => {
      const { v, r, s, nonce } = await testSignature();

      await marketContract
        .connect(buyer)
        .buyNFT(NFT_FOR_SALE, nonce, deadline, v, r, s);

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
        .buyNFT(NFT_FOR_SALE, nonce, deadline, v, r, s);

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
          .buyNFT(NFT_FOR_SALE + 1, nonce, deadline, v, r, s)
      ).to.be.revertedWith("Market: unregistered NFT class");
    });

    it("Should fail due to invalid signature", async () => {
      const { v, r, s, nonce } = await testSignature();

      await expect(
        marketContract
          .connect(buyer)
          .buyNFT(NFT_FOR_SALE, nonce, deadline + 1, v, r, s)
      ).to.be.revertedWith("FiatTokenV2: invalid signature");
    });

    it("Should fail due to not enough funds", async () => {
      await currencyContract
        .connect(buyer)
        .transfer(defaultSigner.address, CURRENCY_BALANCE);

      const { v, r, s, nonce } = await testSignature();

      await expect(
        marketContract
          .connect(buyer)
          .buyNFT(NFT_FOR_SALE, nonce, deadline, v, r, s)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should fail due to expired deadline", async () => {
      const nonce: Uint8Array = ethers.utils.randomBytes(32);
      const deadlineNow = Math.floor(Date.now() / 1000);

      const { v, r, s } = await signAuthorization({
        from: buyer.address,
        to: await marketContract.paymentAddress(NFT_FOR_SALE),
        value: TEST_PRICE_STABLECOIN,
        validAfter: 0,
        validBefore: deadlineNow,
        nonce: nonce,
      });

      await expect(
        marketContract
          .connect(buyer)
          .buyNFT(NFT_FOR_SALE, nonce, deadlineNow, v, r, s)
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
