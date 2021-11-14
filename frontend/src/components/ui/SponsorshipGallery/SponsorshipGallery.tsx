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
import { SponsorshipData } from "types/metadata";
import SponsorshipCard from "./SponsorshipCard";
import SponsorshipView from "./SponsorshipView";
import SponsorshipFinalizingForm from "./SponsorshipFinalizingForm";
import { Col, Row } from "react-bootstrap";

import "./style.scss";

function SponsorshipGallery(props: {
  sponsorshipsIds: BigNumber[];
  stallId: string;
}) {
  console.log("render Sponsorships");

  const { path, url } = useRouteMatch();
  const routerHistory = useHistory();
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
    routerHistory.push(`${url}/${sponsorship.sponsorshipId}`);
  };

  return (
    <div>
      <Switch>
        <Route exact path={path}>
          {sponsorships && (
            <Row>
              {sponsorships
                .filter((sponsorship) => sponsorship.active)
                .map((sponsorship) => {
                  return (
                    <Col
                      md={6}
                      sm={12}
                      key={sponsorship.sponsorshipId.toString()}
                    >
                      <SponsorshipCard
                        {...sponsorship}
                        onSelect={selectSponsorship}
                      />
                    </Col>
                  );
                })}
            </Row>
          )}
        </Route>
        <Route exact path={`${path}/:sponsorshipId`}>
          {sponsorships && (
            <SelectSponsorshipView sponsorships={sponsorships} />
          )}
        </Route>
        <Route exact path={`${path}/:sponsorshipId/fulfill`}>
          {sponsorships && (
            <SelectSponsorshipForm sponsorships={sponsorships} />
          )}
        </Route>
      </Switch>
    </div>
  );
}

export default SponsorshipGallery;

function SelectSponsorshipView(props: { sponsorships: SponsorshipData[] }) {
  const { sponsorshipId } = useParams<{ sponsorshipId: string }>();
  const filteredSponsorships = props.sponsorships.filter((sponsorship) =>
    sponsorship.sponsorshipId.eq(sponsorshipId)
  );

  return (
    <div>
      {filteredSponsorships.length > 0 && (
        <SponsorshipView {...filteredSponsorships[0]} />
      )}
    </div>
  );
}

function SelectSponsorshipForm(props: { sponsorships: SponsorshipData[] }) {
  const { sponsorshipId } = useParams<{ sponsorshipId: string }>();
  const filteredSponsorships = props.sponsorships.filter((sponsorship) =>
    sponsorship.sponsorshipId.eq(sponsorshipId)
  );

  return (
    <div>
      {filteredSponsorships.length > 0 && (
        <SponsorshipFinalizingForm {...filteredSponsorships[0]} />
      )}
    </div>
  );
}
