export type Metadata = {
  name: string;
  description: string;
  image?: string;
  headerImage?: string;
};

export type NFTData = Metadata & {
  supply: number;
  price: number;
  class: number;
};
