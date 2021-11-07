import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { TypedEventFilter } from "types/typechain/common";

export const parseLog = async <T>(
  filter: TypedEventFilter<any, any>,
  provider: Web3Provider,
  contractInterface: ethers.utils.Interface,
  readPosition: number
): Promise<T[]> => {
  console.log("filter", filter);

  const logs = await provider.getLogs({
    ...filter,
    fromBlock: 21063861,
    toBlock: await provider.getBlockNumber(),
  });

  console.log("logs", logs);
  const loadedData: T[] = [];
  logs.forEach((log) => {
    loadedData.push(contractInterface.parseLog(log).args[readPosition]);
  });

  return loadedData;
};
