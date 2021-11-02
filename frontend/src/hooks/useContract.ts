import { contracts } from "../helpers/contracts";
import { Contract, ethers } from "ethers";
import { useEthers, getChainName } from "@usedapp/core";
import { useMemo } from "react";

export function useContract<T extends Contract>(
  contractName: string
): T | null {
  const { chainId, library } = useEthers();

  const contract = useMemo(() => {
    if (!chainId) {
      console.log("no chainid");
      return null;
    }

    console.log("chainId", chainId);
    const chainName =
      getChainName(chainId).toLowerCase() === "hardhat"
        ? "localhost"
        : getChainName(chainId).toLowerCase();
    console.log("chainName:", chainName);

    if (!contracts[chainName]) {
      console.log(
        `Unsupported chain, make sure you are connected to a supported network ${Object.keys(
          contracts
        )}`
      );
      return null;
    }

    return new ethers.Contract(
      contracts[chainName][contractName].address,
      contracts[chainName][contractName].abi,
      library
    ) as T;
  }, [chainId, library, contractName]);

  return contract;
}