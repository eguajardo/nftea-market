import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { TypedEventFilter } from "types/typechain/common";

export const parseLogValue = async <T>(
  filter: TypedEventFilter<any, any>,
  provider: Web3Provider,
  contractInterface: ethers.utils.Interface,
  readPosition: number
): Promise<T[]> => {
  const logs = await getLogs(filter, provider);

  const loadedData: T[] = [];
  logs.forEach((log) => {
    loadedData.push(contractInterface.parseLog(log).args[readPosition]);
  });

  return loadedData;
};

export const parseLogValues = async (
  filter: TypedEventFilter<any, any>,
  provider: Web3Provider,
  contractInterface: ethers.utils.Interface,
  readPositions: number[]
): Promise<any[][]> => {
  const logs = await getLogs(filter, provider);

  const loadedData: any[][] = [];
  logs.forEach((log) => {
    const values: any[] = [];
    readPositions.forEach((position) => {
      values.push(contractInterface.parseLog(log).args[position]);
    });
    loadedData.push(values);
  });

  return loadedData;
};

const getLogs = async (
  filter: TypedEventFilter<any, any>,
  provider: Web3Provider
) => {
  return await provider.getLogs({
    ...filter,
    fromBlock: 21063861,
    toBlock: await provider.getBlockNumber(),
  });
};
