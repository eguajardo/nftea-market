import { getJSONMetadata } from "helpers/ipfs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContractCall, useContractCalls, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { Market } from "types/typechain";
import { Metadata } from "types/metadata";

import NFTGallery from "components/ui/NFTGallery/NFTGallery";
import NewNFT from "./NewNFT";

import {
  Button,
  Col,
  Container,
  Image,
  Nav,
  Navbar,
  NavbarBrand,
  Row,
} from "react-bootstrap";

//import headerImage from "assets/img/img_3115.jpg";
import headerImage from "assets/img/light.jpeg";
//import profileImage from "assets/img/marie.jpg";
import profileImage from "assets/img/james.jpg";

import "./style.scss";

export enum Content {
  About,
  NFTs,
  Sponsorships,
  NewNFT,
}

const classNames = require("classnames");

function Profile() {
  console.log("render Profile");
  const { stallId } = useParams<{ stallId: string }>();
  const marketContract: Market = useContract("Market")!;
  const [metadata, setMetadata] = useState<Metadata>();
  const [contentDisplaying, setContentDisplaying] = useState<Content>(
    Content.About
  );
  const { account } = useEthers();

  const [stallUri, vendorAddress] =
    useContractCalls([
      marketContract &&
        stallId && {
          abi: marketContract.interface,
          address: marketContract.address,
          method: "uri",
          args: [stallId],
        },
      marketContract &&
        stallId && {
          abi: marketContract.interface,
          address: marketContract.address,
          method: "stallVendor",
          args: [stallId],
        },
    ]).reduce((flattenedArray, element) => {
      return flattenedArray?.concat(element);
    }) ?? [];

  const [stallNFTClasses] =
    useContractCall(
      marketContract &&
        stallId && {
          abi: marketContract.interface,
          address: marketContract.address,
          method: "stallNFTs",
          args: [stallId],
        }
    ) ?? [];

  useEffect(() => {
    if (stallUri) {
      getJSONMetadata(stallUri).then((result) => setMetadata(result));
    }
  }, [stallUri]);

  return (
    <Container>
      <div
        className="header-banner"
        style={{
          backgroundImage: `url(${headerImage})`,
        }}
      >
        {vendorAddress && vendorAddress === account && (
          <Container className="admin-menu text-right mb-2">
            <Button
              variant="warning"
              size="sm"
              onClick={() => setContentDisplaying(Content.NewNFT)}
            >
              Create NFT
            </Button>
            <Button variant="warning" size="sm">
              Request sponsorship
            </Button>
          </Container>
        )}
      </div>
      <div className="profile-page-content pb-4">
        <Row>
          <Col md={3} xs={12}>
            <div className="profile-left-column">
              <Image
                className="img-fluid rounded-circle shadow-lg profile-picture"
                src={profileImage}
              />
            </div>
          </Col>
          <Col md={9} xs={12}>
            <Navbar className="bg-transparent mt-2" expand="lg" variant="dark">
              <NavbarBrand className="text-primary font-weight-bold">
                {metadata?.name}
              </NavbarBrand>
              <Navbar.Toggle aria-controls="navigation">
                <span className="navbar-toggler-bar bar1" />
                <span className="navbar-toggler-bar bar2" />
                <span className="navbar-toggler-bar bar3" />
              </Navbar.Toggle>
              <Navbar.Collapse>
                <div className="navbar-collapse-header">
                  <Row>
                    <Col className="collapse-brand text-primary" xs="6">
                      {metadata?.name}
                    </Col>
                    <Col className="collapse-close text-right" xs="6">
                      <Navbar.Toggle aria-controls="navigation">
                        <i className="tim-icons icon-simple-remove" />
                      </Navbar.Toggle>
                    </Col>
                  </Row>
                </div>
                <Nav className="ml-auto" as="ul">
                  <Nav.Item as="li">
                    <Button
                      className={classNames("btn-link", {
                        selected: contentDisplaying === Content.About,
                      })}
                      variant="info"
                      onClick={() => setContentDisplaying(Content.About)}
                    >
                      About
                    </Button>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Button
                      className={classNames("btn-link", {
                        selected: contentDisplaying === Content.NFTs,
                      })}
                      variant="info"
                      onClick={() => setContentDisplaying(Content.NFTs)}
                    >
                      NFTs
                    </Button>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Button
                      className={classNames("btn-link", {
                        selected: contentDisplaying === Content.Sponsorships,
                      })}
                      variant="info"
                      onClick={() => setContentDisplaying(Content.Sponsorships)}
                    >
                      Sponsorships
                    </Button>
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
          </Col>
        </Row>

        <div className="mt-5">
          {contentDisplaying === Content.About && (
            <div className="mt-2">{metadata?.description}</div>
          )}
          {contentDisplaying === Content.NFTs && (
            <NFTGallery nftsClasses={stallNFTClasses} />
          )}
          {contentDisplaying === Content.NewNFT &&
            vendorAddress &&
            vendorAddress === account && (
              <NewNFT setContentDisplaying={setContentDisplaying} />
            )}
        </div>
      </div>
    </Container>
  );
}

export default Profile;
