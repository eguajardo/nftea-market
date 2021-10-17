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

interface ProfileInterface extends ethers.utils.Interface {
  functions: {
    "createProfile(string,string)": FunctionFragment;
    "uri(string)": FunctionFragment;
    "username(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "createProfile",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "uri", values: [string]): string;
  encodeFunctionData(functionFragment: "username", values: [string]): string;

  decodeFunctionResult(
    functionFragment: "createProfile",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "uri", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "username", data: BytesLike): Result;

  events: {
    "ProfileCreated(address,string,string)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ProfileCreated"): EventFragment;
}

export type ProfileCreatedEvent = TypedEvent<
  [string, string, string] & { account: string; username: string; uri: string }
>;

export class Profile extends BaseContract {
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

  interface: ProfileInterface;

  functions: {
    createProfile(
      _username: string,
      _uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    uri(_username: string, overrides?: CallOverrides): Promise<[string]>;

    username(_address: string, overrides?: CallOverrides): Promise<[string]>;
  };

  createProfile(
    _username: string,
    _uri: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  uri(_username: string, overrides?: CallOverrides): Promise<string>;

  username(_address: string, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    createProfile(
      _username: string,
      _uri: string,
      overrides?: CallOverrides
    ): Promise<void>;

    uri(_username: string, overrides?: CallOverrides): Promise<string>;

    username(_address: string, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "ProfileCreated(address,string,string)"(
      account?: string | null,
      username?: string | null,
      uri?: string | null
    ): TypedEventFilter<
      [string, string, string],
      { account: string; username: string; uri: string }
    >;

    ProfileCreated(
      account?: string | null,
      username?: string | null,
      uri?: string | null
    ): TypedEventFilter<
      [string, string, string],
      { account: string; username: string; uri: string }
    >;
  };

  estimateGas: {
    createProfile(
      _username: string,
      _uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    uri(_username: string, overrides?: CallOverrides): Promise<BigNumber>;

    username(_address: string, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    createProfile(
      _username: string,
      _uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    uri(
      _username: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    username(
      _address: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
