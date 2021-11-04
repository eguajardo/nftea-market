import { useCallback } from "react";
import { useEthers } from "@usedapp/core";
import { useContract } from "./useContract";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ERC20PresetFixedSupply } from "types/typechain";
import { BigNumber, ethers } from "ethers";

const STABLECOIN_DECIMALS: number = 6;
const FIAT_DECIMALS: number = 2;

function useAuthorizationSignature() {
  const currencyContract: ERC20PresetFixedSupply =
    useContract<ERC20PresetFixedSupply>("ERC20PresetFixedSupply")!;
  const { chainId } = useEthers();

  const fiatToStablecoin = (fiatAmount: BigNumber): BigNumber => {
    const additionalDecimals = STABLECOIN_DECIMALS - FIAT_DECIMALS;
    const stablecoinAmount = BigNumber.from(fiatAmount).mul(
      BigNumber.from(10).pow(additionalDecimals)
    );

    return stablecoinAmount;
  };

  const signAuthorization = useCallback(
    async (provider: JsonRpcProvider, value: any) => {
      // All properties on a domain are optional
      const signatureDomain = {
        name: await currencyContract.name(),
        version: await currencyContract.version(),
        chainId: chainId,
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

      console.log("DECIMALS", await currencyContract.decimals());

      const nonce: Uint8Array = ethers.utils.randomBytes(32);
      value.nonce = nonce;

      value.value = fiatToStablecoin(value.value);

      const blockNumber: number = await provider.getBlockNumber();
      const timestamp: number = (await provider.getBlock(blockNumber))
        .timestamp;
      const validBefore = timestamp + 86400; // 1 day from block timestamp
      value.validAfter = 0;
      value.validBefore = validBefore;

      console.log("validBefore", blockNumber, timestamp, validBefore);
      console.log("signer", await provider.getSigner().getAddress());
      console.log("value", value);
      const signature = await provider
        .getSigner()
        ._signTypedData(signatureDomain, signatureTypes, value);

      const v = "0x" + signature.slice(130, 132);
      const r = signature.slice(0, 66);
      const s = "0x" + signature.slice(66, 130);

      return { v, r, s, nonce, validBefore };
    },
    [currencyContract, chainId]
  );

  return { signAuthorization, fiatToStablecoin };
}

export default useAuthorizationSignature;
