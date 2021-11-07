import { getJSONMetadata } from "helpers/ipfs";
import { useEffect, useState } from "react";
import { useContractCalls } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { BigNumber } from "ethers";
import { Market } from "types/typechain";
import { SponsorshipData } from "types/metadata";
import SponsorshipCard from "./SponsorshipCard";
import SponsorshipView from "./SponsorshipView";
import { Col, Row } from "react-bootstrap";
import { Content } from "pages/Profile/Profile";

import "./style.scss";

function SponsorshipGallery(props: {
  sponsorshipsIds: BigNumber[];
  stallId: string;
  setContentDisplaying: React.Dispatch<React.SetStateAction<Content>>;
}) {
  console.log("render Sponsorships");

  const [sponsorshipSelected, setSponsorshipSelected] =
    useState<SponsorshipData>();
  const [sponsorships, setSponsorships] = useState<SponsorshipData[]>();
  const marketContract: Market = useContract("Market")!;

  const sponsorshipsData = useContractCalls(
    props.sponsorshipsIds
      ? props.sponsorshipsIds.map((id: BigNumber) => {
          return {
            abi: marketContract.interface,
            address: marketContract.address,
            method: "sponsorshipData",
            args: [id, props.stallId],
          };
        })
      : []
  );

  useEffect(() => {
    if (sponsorshipsData) {
      Promise.all(
        sponsorshipsData
          .filter((element) => !!element)
          .map(async (data): Promise<SponsorshipData> => {
            const [sponsorshipData]: SponsorshipData[] = data!;
            return {
              ...(await getJSONMetadata(sponsorshipData.uri)),
              ...sponsorshipData,
            };
          })
      ).then((result: SponsorshipData[]) => {
        setSponsorships(result);
      });
    }
  }, [sponsorshipsData, props.sponsorshipsIds]);

  const selectSponsorship = (sponsorship: SponsorshipData) => {
    setSponsorshipSelected(sponsorship);
  };

  return (
    <div>
      {sponsorships && !sponsorshipSelected && (
        <Row>
          {sponsorships.map((sponsorship) => {
            return (
              <Col md={6} sm={12} key={sponsorship.sponsorshipId.toString()}>
                <SponsorshipCard
                  {...sponsorship}
                  onSelect={selectSponsorship}
                />
              </Col>
            );
          })}
        </Row>
      )}
      {sponsorshipSelected && (
        <SponsorshipView
          setContentDisplaying={props.setContentDisplaying}
          {...sponsorshipSelected}
        />
      )}
    </div>
  );
}

export default SponsorshipGallery;
