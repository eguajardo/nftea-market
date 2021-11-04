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

function NFTGallery(props: { nftsClasses: BigNumber[] }) {
  console.log("render NFTs");

  const [nftSelected, setNFTSelected] = useState<NFTData>();
  const [nfts, setNFTs] = useState<NFTData[]>();
  const marketContract: Market = useContract("Market")!;

  const nftsData = useContractCalls(
    props.nftsClasses
      ? props.nftsClasses.map((nftClass: BigNumber) => {
          return {
            abi: marketContract.interface,
            address: marketContract.address,
            method: "nftData",
            args: [nftClass],
          };
        })
      : []
  );

  useEffect(() => {
    if (nftsData) {
      Promise.all(
        nftsData
          .filter((element) => !!element)
          .map(async (data, index): Promise<NFTData> => {
            const [uri, supply, price] = data!;
            return {
              ...(await getJSONMetadata(uri)),
              supply: supply,
              price: price,
              nftClass: props.nftsClasses[index],
            };
          })
      ).then((result: NFTData[]) => {
        setNFTs(result);
      });
    }
  }, [nftsData, props.nftsClasses]);

  const selectNFT = (nft: NFTData) => {
    setNFTSelected(nft);
  };

  return (
    <div>
      {nfts &&
        !nftSelected &&
        nfts.map((nft) => {
          return (
            <NFTCard
              key={nft.nftClass.toString()}
              {...nft}
              onSelect={selectNFT}
            />
          );
        })}
      {nftSelected && <NFTView {...nftSelected} />}
    </div>
  );
}

export default NFTGallery;
