/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface MarketInterface extends ethers.utils.Interface {
  functions: {
    "FIAT_DECIMALS()": FunctionFragment;
    "MINIMUM_NFT_PRICE_FIAT()": FunctionFragment;
    "PAYMENT_MAX_SHARES()": FunctionFragment;
    "PLATFORM_COMISSION_SHARES()": FunctionFragment;
    "buyNFT(uint128,bytes32,uint256,uint8,bytes32,bytes32)": FunctionFragment;
    "escrow()": FunctionFragment;
    "nftContract()": FunctionFragment;
    "nftData(uint256)": FunctionFragment;
    "paymentAddress(uint128)": FunctionFragment;
    "postNFTForSale(string,uint128,uint256)": FunctionFragment;
    "postSponsoredNFTForSale(uint256,string)": FunctionFragment;
    "registerStall(string,string)": FunctionFragment;
    "requestSponsorship(uint128,uint256,uint16,string,uint256,uint256)": FunctionFragment;
    "sponsorshipData(uint256,string)": FunctionFragment;
    "stablecoin()": FunctionFragment;
    "stallNFTs(string)": FunctionFragment;
    "stallNameTaken(string)": FunctionFragment;
    "stallVendor(string)": FunctionFragment;
    "updateURI(string)": FunctionFragment;
    "uri(string)": FunctionFragment;
    "uriOrEmpty(address)": FunctionFragment;
    "vendorStallName(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "FIAT_DECIMALS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MINIMUM_NFT_PRICE_FIAT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PAYMENT_MAX_SHARES",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PLATFORM_COMISSION_SHARES",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "buyNFT",
    values: [
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish,
      BytesLike,
      BytesLike
    ]
  ): string;
  encodeFunctionData(functionFragment: "escrow", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "nftContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "nftData",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "paymentAddress",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "postNFTForSale",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "postSponsoredNFTForSale",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "registerStall",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "requestSponsorship",
    values: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "sponsorshipData",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "stablecoin",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "stallNFTs", values: [string]): string;
  encodeFunctionData(
    functionFragment: "stallNameTaken",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "stallVendor", values: [string]): string;
  encodeFunctionData(functionFragment: "updateURI", values: [string]): string;
  encodeFunctionData(functionFragment: "uri", values: [string]): string;
  encodeFunctionData(functionFragment: "uriOrEmpty", values: [string]): string;
  encodeFunctionData(
    functionFragment: "vendorStallName",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "FIAT_DECIMALS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MINIMUM_NFT_PRICE_FIAT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PAYMENT_MAX_SHARES",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PLATFORM_COMISSION_SHARES",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "buyNFT", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "escrow", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "nftContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "nftData", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "paymentAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "postNFTForSale",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "postSponsoredNFTForSale",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerStall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "requestSponsorship",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "sponsorshipData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "stablecoin", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stallNFTs", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stallNameTaken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "stallVendor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "updateURI", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "uri", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "uriOrEmpty", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "vendorStallName",
    data: BytesLike
  ): Result;

  events: {
    "NFTForSale(string,address,uint256,uint128,uint128)": EventFragment;
    "NFTPurchase(address,uint128,string,uint256,uint256)": EventFragment;
    "SponsoredNFT(uint128,uint256)": EventFragment;
    "Sponsorship(uint256,string,uint128,uint256,uint16,string,uint256,uint256)": EventFragment;
    "StallRegistration(address,string,string,string)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NFTForSale"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NFTPurchase"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SponsoredNFT"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Sponsorship"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StallRegistration"): EventFragment;
}

export type NFTForSaleEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber] & {
    stallName: string;
    vendor: string;
    price: BigNumber;
    class: BigNumber;
    supply: BigNumber;
  }
>;

export type NFTPurchaseEvent = TypedEvent<
  [string, BigNumber, string, BigNumber, BigNumber] & {
    buyer: string;
    class: BigNumber;
    stallName: string;
    id: BigNumber;
    price: BigNumber;
  }
>;

export type SponsoredNFTEvent = TypedEvent<
  [BigNumber, BigNumber] & { class: BigNumber; sponsorshipId: BigNumber }
>;

export type SponsorshipEvent = TypedEvent<
  [
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    number,
    string,
    BigNumber,
    BigNumber
  ] & {
    sponsorshipId: BigNumber;
    stallName: string;
    supply: BigNumber;
    price: BigNumber;
    sponsorsShareRatio: number;
    sponsorshipURI: string;
    requestedAmount: BigNumber;
    deadline: BigNumber;
  }
>;

export type StallRegistrationEvent = TypedEvent<
  [string, string, string, string] & {
    vendor: string;
    hashedStallName: string;
    hashedUri: string;
    stallName: string;
  }
>;

export class Market extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: MarketInterface;

  functions: {
    FIAT_DECIMALS(overrides?: CallOverrides): Promise<[number]>;

    MINIMUM_NFT_PRICE_FIAT(overrides?: CallOverrides): Promise<[number]>;

    PAYMENT_MAX_SHARES(overrides?: CallOverrides): Promise<[BigNumber]>;

    PLATFORM_COMISSION_SHARES(overrides?: CallOverrides): Promise<[BigNumber]>;

    buyNFT(
      class_: BigNumberish,
      nonce_: BytesLike,
      validBefore_: BigNumberish,
      v_: BigNumberish,
      r_: BytesLike,
      s_: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    escrow(overrides?: CallOverrides): Promise<[string]>;

    nftContract(overrides?: CallOverrides): Promise<[string]>;

    nftData(
      id_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        [
          string,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          string
        ] & {
          uri: string;
          maxSupply: BigNumber;
          price: BigNumber;
          class: BigNumber;
          serial: BigNumber;
          totalSerialized: BigNumber;
          stallName: string;
        }
      ]
    >;

    paymentAddress(
      class_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    postNFTForSale(
      uri_: string,
      supply_: BigNumberish,
      price_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    postSponsoredNFTForSale(
      sponsorshipId_: BigNumberish,
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    registerStall(
      stallName_: string,
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    requestSponsorship(
      supply_: BigNumberish,
      price_: BigNumberish,
      sponsorsShares_: BigNumberish,
      sponsorshipURI_: string,
      requestedAmount_: BigNumberish,
      deadline_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    sponsorshipData(
      sponsorshipId_: BigNumberish,
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<
      [
        [
          string,
          BigNumber,
          BigNumber,
          string,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          boolean,
          BigNumber,
          BigNumber
        ] & {
          uri: string;
          maxSupply: BigNumber;
          price: BigNumber;
          stallName: string;
          sponsorshipId: BigNumber;
          sponsorsShares: BigNumber;
          requestedAmount: BigNumber;
          deadline: BigNumber;
          active: boolean;
          sponsorsQuantity: BigNumber;
          totalFunds: BigNumber;
        }
      ]
    >;

    stablecoin(overrides?: CallOverrides): Promise<[string]>;

    stallNFTs(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber[]]>;

    stallNameTaken(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    stallVendor(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    updateURI(
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    uri(stallName_: string, overrides?: CallOverrides): Promise<[string]>;

    uriOrEmpty(account_: string, overrides?: CallOverrides): Promise<[string]>;

    vendorStallName(
      vendor_: string,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  FIAT_DECIMALS(overrides?: CallOverrides): Promise<number>;

  MINIMUM_NFT_PRICE_FIAT(overrides?: CallOverrides): Promise<number>;

  PAYMENT_MAX_SHARES(overrides?: CallOverrides): Promise<BigNumber>;

  PLATFORM_COMISSION_SHARES(overrides?: CallOverrides): Promise<BigNumber>;

  buyNFT(
    class_: BigNumberish,
    nonce_: BytesLike,
    validBefore_: BigNumberish,
    v_: BigNumberish,
    r_: BytesLike,
    s_: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  escrow(overrides?: CallOverrides): Promise<string>;

  nftContract(overrides?: CallOverrides): Promise<string>;

  nftData(
    id_: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, string] & {
      uri: string;
      maxSupply: BigNumber;
      price: BigNumber;
      class: BigNumber;
      serial: BigNumber;
      totalSerialized: BigNumber;
      stallName: string;
    }
  >;

  paymentAddress(
    class_: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  postNFTForSale(
    uri_: string,
    supply_: BigNumberish,
    price_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  postSponsoredNFTForSale(
    sponsorshipId_: BigNumberish,
    uri_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  registerStall(
    stallName_: string,
    uri_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  requestSponsorship(
    supply_: BigNumberish,
    price_: BigNumberish,
    sponsorsShares_: BigNumberish,
    sponsorshipURI_: string,
    requestedAmount_: BigNumberish,
    deadline_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  sponsorshipData(
    sponsorshipId_: BigNumberish,
    stallName_: string,
    overrides?: CallOverrides
  ): Promise<
    [
      string,
      BigNumber,
      BigNumber,
      string,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      boolean,
      BigNumber,
      BigNumber
    ] & {
      uri: string;
      maxSupply: BigNumber;
      price: BigNumber;
      stallName: string;
      sponsorshipId: BigNumber;
      sponsorsShares: BigNumber;
      requestedAmount: BigNumber;
      deadline: BigNumber;
      active: boolean;
      sponsorsQuantity: BigNumber;
      totalFunds: BigNumber;
    }
  >;

  stablecoin(overrides?: CallOverrides): Promise<string>;

  stallNFTs(
    stallName_: string,
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  stallNameTaken(
    stallName_: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  stallVendor(stallName_: string, overrides?: CallOverrides): Promise<string>;

  updateURI(
    uri_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  uri(stallName_: string, overrides?: CallOverrides): Promise<string>;

  uriOrEmpty(account_: string, overrides?: CallOverrides): Promise<string>;

  vendorStallName(vendor_: string, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    FIAT_DECIMALS(overrides?: CallOverrides): Promise<number>;

    MINIMUM_NFT_PRICE_FIAT(overrides?: CallOverrides): Promise<number>;

    PAYMENT_MAX_SHARES(overrides?: CallOverrides): Promise<BigNumber>;

    PLATFORM_COMISSION_SHARES(overrides?: CallOverrides): Promise<BigNumber>;

    buyNFT(
      class_: BigNumberish,
      nonce_: BytesLike,
      validBefore_: BigNumberish,
      v_: BigNumberish,
      r_: BytesLike,
      s_: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    escrow(overrides?: CallOverrides): Promise<string>;

    nftContract(overrides?: CallOverrides): Promise<string>;

    nftData(
      id_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        string
      ] & {
        uri: string;
        maxSupply: BigNumber;
        price: BigNumber;
        class: BigNumber;
        serial: BigNumber;
        totalSerialized: BigNumber;
        stallName: string;
      }
    >;

    paymentAddress(
      class_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    postNFTForSale(
      uri_: string,
      supply_: BigNumberish,
      price_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    postSponsoredNFTForSale(
      sponsorshipId_: BigNumberish,
      uri_: string,
      overrides?: CallOverrides
    ): Promise<void>;

    registerStall(
      stallName_: string,
      uri_: string,
      overrides?: CallOverrides
    ): Promise<void>;

    requestSponsorship(
      supply_: BigNumberish,
      price_: BigNumberish,
      sponsorsShares_: BigNumberish,
      sponsorshipURI_: string,
      requestedAmount_: BigNumberish,
      deadline_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    sponsorshipData(
      sponsorshipId_: BigNumberish,
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        BigNumber,
        BigNumber,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        boolean,
        BigNumber,
        BigNumber
      ] & {
        uri: string;
        maxSupply: BigNumber;
        price: BigNumber;
        stallName: string;
        sponsorshipId: BigNumber;
        sponsorsShares: BigNumber;
        requestedAmount: BigNumber;
        deadline: BigNumber;
        active: boolean;
        sponsorsQuantity: BigNumber;
        totalFunds: BigNumber;
      }
    >;

    stablecoin(overrides?: CallOverrides): Promise<string>;

    stallNFTs(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    stallNameTaken(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    stallVendor(stallName_: string, overrides?: CallOverrides): Promise<string>;

    updateURI(uri_: string, overrides?: CallOverrides): Promise<void>;

    uri(stallName_: string, overrides?: CallOverrides): Promise<string>;

    uriOrEmpty(account_: string, overrides?: CallOverrides): Promise<string>;

    vendorStallName(
      vendor_: string,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "NFTForSale(string,address,uint256,uint128,uint128)"(
      stallName?: string | null,
      vendor?: string | null,
      price?: null,
      _class?: null,
      supply?: null
    ): TypedEventFilter<
      [string, string, BigNumber, BigNumber, BigNumber],
      {
        stallName: string;
        vendor: string;
        price: BigNumber;
        class: BigNumber;
        supply: BigNumber;
      }
    >;

    NFTForSale(
      stallName?: string | null,
      vendor?: string | null,
      price?: null,
      _class?: null,
      supply?: null
    ): TypedEventFilter<
      [string, string, BigNumber, BigNumber, BigNumber],
      {
        stallName: string;
        vendor: string;
        price: BigNumber;
        class: BigNumber;
        supply: BigNumber;
      }
    >;

    "NFTPurchase(address,uint128,string,uint256,uint256)"(
      buyer?: string | null,
      _class?: BigNumberish | null,
      stallName?: string | null,
      id?: null,
      price?: null
    ): TypedEventFilter<
      [string, BigNumber, string, BigNumber, BigNumber],
      {
        buyer: string;
        class: BigNumber;
        stallName: string;
        id: BigNumber;
        price: BigNumber;
      }
    >;

    NFTPurchase(
      buyer?: string | null,
      _class?: BigNumberish | null,
      stallName?: string | null,
      id?: null,
      price?: null
    ): TypedEventFilter<
      [string, BigNumber, string, BigNumber, BigNumber],
      {
        buyer: string;
        class: BigNumber;
        stallName: string;
        id: BigNumber;
        price: BigNumber;
      }
    >;

    "SponsoredNFT(uint128,uint256)"(
      _class?: BigNumberish | null,
      sponsorshipId?: BigNumberish | null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { class: BigNumber; sponsorshipId: BigNumber }
    >;

    SponsoredNFT(
      _class?: BigNumberish | null,
      sponsorshipId?: BigNumberish | null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { class: BigNumber; sponsorshipId: BigNumber }
    >;

    "Sponsorship(uint256,string,uint128,uint256,uint16,string,uint256,uint256)"(
      sponsorshipId?: BigNumberish | null,
      stallName?: string | null,
      supply?: null,
      price?: null,
      sponsorsShareRatio?: null,
      sponsorshipURI?: null,
      requestedAmount?: null,
      deadline?: null
    ): TypedEventFilter<
      [
        BigNumber,
        string,
        BigNumber,
        BigNumber,
        number,
        string,
        BigNumber,
        BigNumber
      ],
      {
        sponsorshipId: BigNumber;
        stallName: string;
        supply: BigNumber;
        price: BigNumber;
        sponsorsShareRatio: number;
        sponsorshipURI: string;
        requestedAmount: BigNumber;
        deadline: BigNumber;
      }
    >;

    Sponsorship(
      sponsorshipId?: BigNumberish | null,
      stallName?: string | null,
      supply?: null,
      price?: null,
      sponsorsShareRatio?: null,
      sponsorshipURI?: null,
      requestedAmount?: null,
      deadline?: null
    ): TypedEventFilter<
      [
        BigNumber,
        string,
        BigNumber,
        BigNumber,
        number,
        string,
        BigNumber,
        BigNumber
      ],
      {
        sponsorshipId: BigNumber;
        stallName: string;
        supply: BigNumber;
        price: BigNumber;
        sponsorsShareRatio: number;
        sponsorshipURI: string;
        requestedAmount: BigNumber;
        deadline: BigNumber;
      }
    >;

    "StallRegistration(address,string,string,string)"(
      vendor?: string | null,
      hashedStallName?: string | null,
      hashedUri?: string | null,
      stallName?: null
    ): TypedEventFilter<
      [string, string, string, string],
      {
        vendor: string;
        hashedStallName: string;
        hashedUri: string;
        stallName: string;
      }
    >;

    StallRegistration(
      vendor?: string | null,
      hashedStallName?: string | null,
      hashedUri?: string | null,
      stallName?: null
    ): TypedEventFilter<
      [string, string, string, string],
      {
        vendor: string;
        hashedStallName: string;
        hashedUri: string;
        stallName: string;
      }
    >;
  };

  estimateGas: {
    FIAT_DECIMALS(overrides?: CallOverrides): Promise<BigNumber>;

    MINIMUM_NFT_PRICE_FIAT(overrides?: CallOverrides): Promise<BigNumber>;

    PAYMENT_MAX_SHARES(overrides?: CallOverrides): Promise<BigNumber>;

    PLATFORM_COMISSION_SHARES(overrides?: CallOverrides): Promise<BigNumber>;

    buyNFT(
      class_: BigNumberish,
      nonce_: BytesLike,
      validBefore_: BigNumberish,
      v_: BigNumberish,
      r_: BytesLike,
      s_: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    escrow(overrides?: CallOverrides): Promise<BigNumber>;

    nftContract(overrides?: CallOverrides): Promise<BigNumber>;

    nftData(id_: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    paymentAddress(
      class_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    postNFTForSale(
      uri_: string,
      supply_: BigNumberish,
      price_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    postSponsoredNFTForSale(
      sponsorshipId_: BigNumberish,
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    registerStall(
      stallName_: string,
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    requestSponsorship(
      supply_: BigNumberish,
      price_: BigNumberish,
      sponsorsShares_: BigNumberish,
      sponsorshipURI_: string,
      requestedAmount_: BigNumberish,
      deadline_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    sponsorshipData(
      sponsorshipId_: BigNumberish,
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stablecoin(overrides?: CallOverrides): Promise<BigNumber>;

    stallNFTs(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stallNameTaken(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stallVendor(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    updateURI(
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    uri(stallName_: string, overrides?: CallOverrides): Promise<BigNumber>;

    uriOrEmpty(account_: string, overrides?: CallOverrides): Promise<BigNumber>;

    vendorStallName(
      vendor_: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    FIAT_DECIMALS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MINIMUM_NFT_PRICE_FIAT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    PAYMENT_MAX_SHARES(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    PLATFORM_COMISSION_SHARES(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    buyNFT(
      class_: BigNumberish,
      nonce_: BytesLike,
      validBefore_: BigNumberish,
      v_: BigNumberish,
      r_: BytesLike,
      s_: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    escrow(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nftContract(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nftData(
      id_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    paymentAddress(
      class_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    postNFTForSale(
      uri_: string,
      supply_: BigNumberish,
      price_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    postSponsoredNFTForSale(
      sponsorshipId_: BigNumberish,
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    registerStall(
      stallName_: string,
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    requestSponsorship(
      supply_: BigNumberish,
      price_: BigNumberish,
      sponsorsShares_: BigNumberish,
      sponsorshipURI_: string,
      requestedAmount_: BigNumberish,
      deadline_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    sponsorshipData(
      sponsorshipId_: BigNumberish,
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    stablecoin(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    stallNFTs(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    stallNameTaken(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    stallVendor(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    updateURI(
      uri_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    uri(
      stallName_: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    uriOrEmpty(
      account_: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    vendorStallName(
      vendor_: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
