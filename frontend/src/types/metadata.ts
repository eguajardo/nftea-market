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
  serial: BigNumber;
  stallName: string;
};

export type SponsorshipData = Omit<NFTData, "serial" | "class"> & {
  sponsorshipId: BigNumber;
  sponsorsShares: BigNumber;
  requestedAmount: BigNumber;
  deadline: BigNumber;
  active: boolean;
  sponsorsQuantity: BigNumber;
  totalFunds: BigNumber;
};
