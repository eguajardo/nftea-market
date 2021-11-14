import { getJSONMetadata } from "helpers/ipfs";
import { useEffect, useState } from "react";
import {
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from "react-router-dom";
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

  const { path, url } = useRouteMatch();
  const routerHistory = useHistory();
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
    console.log("nft.class", nft.class);
    console.log("nft.serial", nft.serial);
    routerHistory.push(
      `${url}/${nft.class.shl(128).add(nft.serial).toString()}` // Convert class and serial to ID
    );
  };

  return (
    <div>
      <Switch>
        <Route exact path={path}>
          {nfts &&
            nfts.map((nft) => {
              return (
                <NFTCard
                  key={nft.serial.toString() + " :: " + nft.class.toString()}
                  {...nft}
                  onSelect={selectNFT}
                />
              );
            })}
        </Route>
        <Route path={`${path}/:nftId`}>
          {nfts && <SelectNFTView nfts={nfts} />}
        </Route>
      </Switch>
    </div>
  );
}

export default NFTGallery;

function SelectNFTView(props: { nfts: NFTData[] }) {
  const { nftId } = useParams<{ nftId: string }>();
  const filteredNFTs = props.nfts.filter((nft) =>
    nft.class.shl(128).add(nft.serial).eq(nftId)
  );

  return (
    <div>{filteredNFTs.length > 0 && <NFTView {...filteredNFTs[0]} />}</div>
  );
}
