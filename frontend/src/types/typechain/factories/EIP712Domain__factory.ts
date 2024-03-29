/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { EIP712Domain, EIP712DomainInterface } from "../EIP712Domain";

const _abi = [
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b5060858061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80633644e51514602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b6000548156fea26469706673582212203c14def498d1400211fe1935d439ff4fc40e25584ec1cdd123ed8e655493b9e564736f6c634300060c0033";

export class EIP712Domain__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<EIP712Domain> {
    return super.deploy(overrides || {}) as Promise<EIP712Domain>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): EIP712Domain {
    return super.attach(address) as EIP712Domain;
  }
  connect(signer: Signer): EIP712Domain__factory {
    return super.connect(signer) as EIP712Domain__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): EIP712DomainInterface {
    return new utils.Interface(_abi) as EIP712DomainInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): EIP712Domain {
    return new Contract(address, _abi, signerOrProvider) as EIP712Domain;
  }
}
