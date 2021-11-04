import { getJSONMetadata } from "helpers/ipfs";
import { useEffect, useState } from "react";
import { useContractCall, useContractCalls } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { BigNumber } from "ethers";
import { Market } from "types/typechain";
import { NFTData } from "types/metadata";
import { Card, Image } from "react-bootstrap";

function NFTs(props: { stallId: string }) {
  console.log("render NFTs");

  const [nfts, setNFTs] = useState<NFTData[]>();
  const marketContract: Market = useContract("Market")!;
  const [nftsClasses] =
    useContractCall(
      marketContract &&
        props.stallId && {
          abi: marketContract.interface,
          address: marketContract.address,
          method: "stallNFTs",
          args: [props.stallId],
        }
    ) ?? [];

  const nftsData = useContractCalls(
    nftsClasses
      ? nftsClasses.map((nftClass: BigNumber) => {
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
              class: nftsClasses[index],
            };
          })
      ).then((result: NFTData[]) => {
        setNFTs(result);
      });
    }
  }, [nftsData, nftsClasses]);

  return (
    <div>
      {nfts &&
        nfts.map((nft) => {
          return (
            <Card key={nft.class} className="card-product">
              <a href="#pablo">
                <div className="card-image">
                  <Image src={nft.image} className="align-middle" />
                </div>
              </a>
              <Card.Body>
                <a href="#pablo">
                  <Card.Title as="h4">{nft.name}</Card.Title>
                </a>
                <Card.Footer>
                  <div className="price-container">
                    <span className="price">
                      $ {(nft.price / 100).toFixed(2)} USD
                    </span>
                  </div>
                </Card.Footer>
              </Card.Body>
            </Card>
          );
        })}
    </div>
  );
}

export default NFTs;
