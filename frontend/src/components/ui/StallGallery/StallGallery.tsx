import { getJSONMetadata } from "helpers/ipfs";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useContractCalls } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { Market } from "types/typechain";
import { StallData } from "types/metadata";
import StallCard from "components/ui/StallGallery/StallCard";

import "./style.scss";
import { Col, Row } from "react-bootstrap";

function StallGallery(props: { stallIds: string[] }) {
  console.log("render Stalls");
  const routerHistory = useHistory();
  const [stalls, setStalls] = useState<StallData[]>();
  const marketContract: Market = useContract("Market")!;

  const stallsUris = useContractCalls(
    props.stallIds
      ? props.stallIds.map((stallName: string) => {
          return {
            abi: marketContract.interface,
            address: marketContract.address,
            method: "uri",
            args: [stallName],
          };
        })
      : []
  );

  console.log("stallsUris", stallsUris);

  useEffect(() => {
    if (stallsUris) {
      Promise.all(
        stallsUris
          .map((uriArray, index): { uri?: string; stallId: string } => {
            return {
              uri: uriArray ? uriArray[0] : undefined,
              stallId: props.stallIds[index],
            };
          })
          .filter((data) => !!data?.uri)
          .map(async (data): Promise<StallData> => {
            return {
              ...(await getJSONMetadata(data.uri!)),
              uri: data.uri!,
              stallId: data.stallId,
            };
          })
      ).then((result: StallData[]) => {
        setStalls(result);
      });
    }
  }, [stallsUris, props.stallIds]);

  const selectStall = (stall: StallData) => {
    routerHistory.push(`/${stall.stallId}`);
  };

  return (
    <div>
      {stalls && (
        <Row>
          {stalls.map((stall) => {
            return (
              <Col lg={4} md={6} sm={12} key={stall.stallId}>
                <StallCard
                  key={stall.stallId}
                  {...stall}
                  onSelect={selectStall}
                />
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}

export default StallGallery;
