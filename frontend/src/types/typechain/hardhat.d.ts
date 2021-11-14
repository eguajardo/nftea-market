/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "AccessControl",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControl__factory>;
    getContractFactory(
      name: "AccessControlEnumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControlEnumerable__factory>;
    getContractFactory(
      name: "IAccessControl",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControl__factory>;
    getContractFactory(
      name: "IAccessControlEnumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControlEnumerable__factory>;
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "PaymentSplitter",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.PaymentSplitter__factory>;
    getContractFactory(
      name: "ERC1155",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155__factory>;
    getContractFactory(
      name: "ERC1155Supply",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155Supply__factory>;
    getContractFactory(
      name: "IERC1155MetadataURI",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155MetadataURI__factory>;
    getContractFactory(
      name: "IERC1155",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155__factory>;
    getContractFactory(
      name: "IERC1155Receiver",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155Receiver__factory>;
    getContractFactory(
      name: "ERC1155Holder",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155Holder__factory>;
    getContractFactory(
      name: "ERC1155Receiver",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155Receiver__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "ERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC165__factory>;
    getContractFactory(
      name: "IERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC165__factory>;
    getContractFactory(
      name: "ERC1155Serialized",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155Serialized__factory>;
    getContractFactory(
      name: "IEIP3009",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IEIP3009__factory>;
    getContractFactory(
      name: "Market",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Market__factory>;
    getContractFactory(
      name: "MultiToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.MultiToken__factory>;
    getContractFactory(
      name: "SponsorshipEscrow",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SponsorshipEscrow__factory>;
    getContractFactory(
      name: "AbstractFiatTokenV1",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AbstractFiatTokenV1__factory>;
    getContractFactory(
      name: "EIP3009",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.EIP3009__factory>;
    getContractFactory(
      name: "EIP712Domain",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.EIP712Domain__factory>;
    getContractFactory(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20__factory>;
    getContractFactory(
      name: "ERC20Burnable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20Burnable__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "ERC20PresetFixedSupply",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20PresetFixedSupply__factory>;
    getContractFactory(
      name: "ExposedERC1155Serialized",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ExposedERC1155Serialized__factory>;

    getContractAt(
      name: "AccessControl",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControl>;
    getContractAt(
      name: "AccessControlEnumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControlEnumerable>;
    getContractAt(
      name: "IAccessControl",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControl>;
    getContractAt(
      name: "IAccessControlEnumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControlEnumerable>;
    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "PaymentSplitter",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.PaymentSplitter>;
    getContractAt(
      name: "ERC1155",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155>;
    getContractAt(
      name: "ERC1155Supply",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155Supply>;
    getContractAt(
      name: "IERC1155MetadataURI",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155MetadataURI>;
    getContractAt(
      name: "IERC1155",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155>;
    getContractAt(
      name: "IERC1155Receiver",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155Receiver>;
    getContractAt(
      name: "ERC1155Holder",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155Holder>;
    getContractAt(
      name: "ERC1155Receiver",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155Receiver>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "ERC165",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC165>;
    getContractAt(
      name: "IERC165",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC165>;
    getContractAt(
      name: "ERC1155Serialized",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155Serialized>;
    getContractAt(
      name: "IEIP3009",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IEIP3009>;
    getContractAt(
      name: "Market",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Market>;
    getContractAt(
      name: "MultiToken",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.MultiToken>;
    getContractAt(
      name: "SponsorshipEscrow",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SponsorshipEscrow>;
    getContractAt(
      name: "AbstractFiatTokenV1",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AbstractFiatTokenV1>;
    getContractAt(
      name: "EIP3009",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.EIP3009>;
    getContractAt(
      name: "EIP712Domain",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.EIP712Domain>;
    getContractAt(
      name: "ERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20>;
    getContractAt(
      name: "ERC20Burnable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20Burnable>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "ERC20PresetFixedSupply",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20PresetFixedSupply>;
    getContractAt(
      name: "ExposedERC1155Serialized",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ExposedERC1155Serialized>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}
