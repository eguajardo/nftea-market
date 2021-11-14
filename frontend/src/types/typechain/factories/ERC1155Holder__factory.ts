/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ERC1155Holder, ERC1155HolderInterface } from "../ERC1155Holder";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155BatchReceived",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506103b8806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806301ffc9a714610046578063bc197c811461006e578063f23a6e61146100a6575b600080fd5b61005961005436600461030c565b6100c5565b60405190151581526020015b60405180910390f35b61008d61007c366004610203565b63bc197c8160e01b95945050505050565b6040516001600160e01b03199091168152602001610065565b61008d6100b43660046102a9565b63f23a6e6160e01b95945050505050565b60006001600160e01b03198216630271189760e51b14806100f657506301ffc9a760e01b6001600160e01b03198316145b90505b919050565b80356001600160a01b03811681146100f957600080fd5b600082601f830112610125578081fd5b8135602067ffffffffffffffff8211156101415761014161036c565b8160051b61015082820161033b565b83815282810190868401838801850189101561016a578687fd5b8693505b8584101561018c57803583526001939093019291840191840161016e565b50979650505050505050565b600082601f8301126101a8578081fd5b813567ffffffffffffffff8111156101c2576101c261036c565b6101d5601f8201601f191660200161033b565b8181528460208386010111156101e9578283fd5b816020850160208301379081016020019190915292915050565b600080600080600060a0868803121561021a578081fd5b610223866100fe565b9450610231602087016100fe565b9350604086013567ffffffffffffffff8082111561024d578283fd5b61025989838a01610115565b9450606088013591508082111561026e578283fd5b61027a89838a01610115565b9350608088013591508082111561028f578283fd5b5061029c88828901610198565b9150509295509295909350565b600080600080600060a086880312156102c0578081fd5b6102c9866100fe565b94506102d7602087016100fe565b93506040860135925060608601359150608086013567ffffffffffffffff811115610300578182fd5b61029c88828901610198565b60006020828403121561031d578081fd5b81356001600160e01b031981168114610334578182fd5b9392505050565b604051601f8201601f1916810167ffffffffffffffff811182821017156103645761036461036c565b604052919050565b634e487b7160e01b600052604160045260246000fdfea2646970667358221220a3dc16937ed76964e4ff01c81032328c2e415b8f620c38bd2a2f5deca5decd1c64736f6c63430008030033";

export class ERC1155Holder__factory extends ContractFactory {
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
  ): Promise<ERC1155Holder> {
    return super.deploy(overrides || {}) as Promise<ERC1155Holder>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ERC1155Holder {
    return super.attach(address) as ERC1155Holder;
  }
  connect(signer: Signer): ERC1155Holder__factory {
    return super.connect(signer) as ERC1155Holder__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC1155HolderInterface {
    return new utils.Interface(_abi) as ERC1155HolderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC1155Holder {
    return new Contract(address, _abi, signerOrProvider) as ERC1155Holder;
  }
}