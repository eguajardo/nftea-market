import { getJSONMetadata } from "helpers/ipfs";
import { useEffect, useState } from "react";
import { useContractCalls } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { BigNumber } from "ethers";
import { Market } from "types/typechain";
import { NFTData } from "types/metadata";
import NFTView from "components/ui/NFTGallery/NFTView";
import NFTCard from "components/ui/NFTGallery/NFTCard";

import "./style.scss";

function NFTGallery(props: { nftsIds: BigNumber[] }) {
  console.log("render NFTs");

  const [nftSelected, setNFTSelected] = useState<NFTData>();
  const [nfts, setNFTs] = useState<NFTData[]>();
  const marketContract: Market = useContract("Market")!;

  const nftsData = useContractCalls(
    props.nftsIds
      ? props.nftsIds.map((id: BigNumber) => {
          return {
            abi: marketContract.interface,
            address: marketContract.address,
            method: "nftData",
            args: [id],
          };
        })
      : []
  );

  console.log("nftsData", nftsData);

  useEffect(() => {
    if (nftsData) {
      Promise.all(
        nftsData
          .filter((element) => !!element)
          .map(async (data): Promise<NFTData> => {
            const [nftData]: NFTData[] = data!;
            return {
              ...(await getJSONMetadata(nftData.uri)),
              ...nftData,
            };
          })
      ).then((result: NFTData[]) => {
        setNFTs(result);
      });
    }
  }, [nftsData, props.nftsIds]);

  const selectNFT = (nft: NFTData) => {
    setNFTSelected(nft);
  };

  return (
    <div>
      {nfts &&
        !nftSelected &&
        nfts.map((nft) => {
          return (
            <NFTCard key={nft.class.toString()} {...nft} onSelect={selectNFT} />
          );
        })}
      {nftSelected && <NFTView {...nftSelected} />}
    </div>
  );
}

export default NFTGallery;
