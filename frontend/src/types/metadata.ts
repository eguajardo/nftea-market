import { BigNumber } from "ethers";

export type Metadata = {
  name: string;
  description: string;
  image?: string;
  headerImage?: string;
};

export type NFTData = Metadata & {
  supply: BigNumber;
  price: BigNumber;
  nftClass: BigNumber;
};
