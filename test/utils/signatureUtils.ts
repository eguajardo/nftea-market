import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20PresetFixedSupply } from "../../typechain";

export const signAuthorization = async (
  signer: SignerWithAddress,
  currencyContract: ERC20PresetFixedSupply,
  value: object
) => {
  // All properties on a domain are optional
  const signatureDomain = {
    name: await currencyContract.name(),
    version: await currencyContract.version(),
    chainId: 31337,
    verifyingContract: currencyContract.address,
  };
  // The named list of all type definitions
  const signatureTypes = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };

  const signature = await signer._signTypedData(
    signatureDomain,
    signatureTypes,
    value
  );

  const v = "0x" + signature.slice(130, 132);
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);

  return { v, r, s };
};
