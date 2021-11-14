import { useMemo } from "react";
import { contracts } from "../helpers/contracts";
import { BaseContract, ethers } from "ethers";
import { useEthers, getChainName } from "@usedapp/core";
import { RelayProvider } from "@opengsn/provider";

declare global {
  interface Window {
    ethereum: any;
  }
}

export function useContract<T extends BaseContract>(
  contractName: string,
  contractAddress?: string
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

    console.log("window.ethereum", window.ethereum);

    const address = contractAddress
      ? contractAddress
      : contracts[chainName][contractName].address;

    if (!address) {
      return null;
    }

    return new ethers.Contract(
      address,
      contracts[chainName][contractName].abi,
      library
    ) as T;
  }, [chainId, contractAddress, contractName, library]);

  return contract;
}

const getRelayProvider = async (paymasterAddress: any) => {
  const gsnProvider = await RelayProvider.newProvider({
    provider: window.ethereum,
    config: {
      //loggerConfiguration: { logLevel: 'error' },
      paymasterAddress,
    },
  }).init();
};
