import { BigNumber } from "ethers";

export type Metadata = {
  name: string;
  description: string;
  image?: string;
  headerImage?: string;
};

export type NFTData = Metadata & {
  uri: string;
  maxSupply: BigNumber;
  price: BigNumber;
  class: BigNumber;
  serial?: BigNumber;
};
