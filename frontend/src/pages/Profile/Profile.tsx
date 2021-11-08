import { getJSONMetadata } from "helpers/ipfs";
import { parseLog } from "helpers/logs";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContractCall, useContractCalls, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { FileWithPath, useDropzone } from "react-dropzone";
import { BigNumber } from "ethers";
import { Market } from "types/typechain";
import { Metadata } from "types/metadata";

import LoadingContainer from "components/layout/LoadingContainer";
import NFTGallery from "components/ui/NFTGallery/NFTGallery";
import SponsorshipGallery from "components/ui/SponsorshipGallery/SponsorshipGallery";
import NewNFT from "./NewNFT";
import NewSponsorship from "./NewSponsorship";

import {
  Button,
  Col,
  Container,
  Form,
  Image,
  Nav,
  Navbar,
  NavbarBrand,
  Row,
} from "react-bootstrap";

import placeholderHeaderImage from "assets/img/image_placeholder.jpg";
import placeholderProfileImage from "assets/img/placeholder.jpg";

import "./style.scss";
import AdminMenu from "./AdminMenu";

export enum Content {
  About,
  NFTs,
  Sponsorships,
  NewNFT,
  NewSponsorship,
}

const classNames = require("classnames");

export type ImageSource = {
  src: string;
  file?: File | FileWithPath;
};

function Profile() {
  console.log("render Profile");
  const { stallId } = useParams<{ stallId: string }>();
  const marketContract: Market = useContract<Market>("Market")!;
  const [metadata, setMetadata] = useState<Metadata>();
  const [profilePic, setProfilePic] = useState<ImageSource>();
  const [headerPic, setHeaderPic] = useState<ImageSource>();
  const [editing, setEditing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sponsorshipsIds, setSponsorshipsIds] = useState<BigNumber[]>([]);
  const [contentDisplaying, setContentDisplaying] = useState<Content>(
    Content.About
  );
  const { account, library } = useEthers();

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

  const loadSponsorships = useCallback(async () => {
    if (!library || !marketContract) {
      return;
    }

    const filter = marketContract.filters.Sponsorship(null, stallId);
    const loadedSponsorshipIDs: BigNumber[] = await parseLog<BigNumber>(
      filter,
      library,
      marketContract.interface,
      0
    );

    setSponsorshipsIds(loadedSponsorshipIDs);
  }, [library, marketContract, stallId]);

  useEffect(() => {
    loadSponsorships();
  }, [loadSponsorships, contentDisplaying]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    maxFiles: 1,
    onDropAccepted: (acceptedFiles, event) => {
      setProfilePic({
        src: URL.createObjectURL(acceptedFiles[0]),
        file: acceptedFiles[0],
      });
    },
  });

  const {
    getRootProps: getRootHeaderProps,
    getInputProps: getInputHeaderProps,
  } = useDropzone({
    accept: "image/*",
    maxFiles: 1,
    onDropAccepted: (acceptedFiles, event) => {
      setHeaderPic({
        src: URL.createObjectURL(acceptedFiles[0]),
        file: acceptedFiles[0],
      });
    },
  });

  const resetImages = useCallback(() => {
    setProfilePic({
      src: metadata?.image ? metadata.image : placeholderProfileImage,
    });
    setHeaderPic({
      src: metadata?.headerImage
        ? metadata.headerImage
        : placeholderHeaderImage,
    });
  }, [metadata?.headerImage, metadata?.image]);

  useEffect(() => {
    resetImages();
  }, [resetImages]);

  useEffect(() => {
    if (
      (editing || !metadata?.headerImage || !metadata?.image) &&
      vendorAddress === account
    ) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  }, [account, editing, metadata?.headerImage, metadata?.image, vendorAddress]);

  useEffect(() => {
    if (!editMode) {
      resetImages();
    }
  }, [editMode, resetImages]);

  useEffect(() => {
    if ((profilePic?.file || headerPic?.file) && vendorAddress === account) {
      setEditing(true);
    } else {
      setEditing(false);
    }
  }, [profilePic?.file, headerPic?.file, vendorAddress, account]);

  const updatingHeaderImage =
    (editMode || !metadata?.headerImage) && vendorAddress === account;
  const updatingProfileImage =
    (editMode || !metadata?.image) && vendorAddress === account;

  return (
    <LoadingContainer condition={metadata}>
      <Container>
        {!updatingHeaderImage && (
          <div
            className="header-banner"
            style={{
              backgroundImage: `url(${headerPic?.src})`,
            }}
          >
            <AdminMenu
              vendorAddress={vendorAddress}
              metadata={metadata}
              setContentDisplaying={setContentDisplaying}
              profilePic={profilePic}
              headerPic={headerPic}
              editing={editing}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          </div>
        )}
        {updatingHeaderImage && (
          <div
            {...getRootHeaderProps({
              className: classNames("dropzone header-banner"),
              style: {
                backgroundImage: `url(${headerPic?.src})`,
              },
            })}
          >
            <Form.Control {...getInputHeaderProps({})} />
            <div className="dropzone-message">Click or Drop to set image</div>
            <AdminMenu
              vendorAddress={vendorAddress}
              metadata={metadata}
              setContentDisplaying={setContentDisplaying}
              profilePic={profilePic}
              headerPic={headerPic}
              editing={editing}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          </div>
        )}
        <div className="profile-page-content pb-4">
          <Row>
            <Col md={3} xs={12}>
              <div className="profile-left-column">
                {!updatingProfileImage && (
                  <Image
                    className="rounded-circle shadow-lg profile-picture"
                    src={profilePic?.src}
                  />
                )}
                {updatingProfileImage && (
                  <div
                    {...getRootProps({
                      className: classNames(
                        "dropzone rounded-circle shadow-lg profile-picture"
                      ),
                      style: {
                        backgroundImage: `url(${profilePic?.src})`,
                      },
                    })}
                  >
                    <Form.Control {...getInputProps({})} />
                    <div className="dropzone-message">
                      Click or Drop to set image
                    </div>
                  </div>
                )}
              </div>
            </Col>
            <Col md={9} xs={12}>
              <Navbar
                className="bg-transparent mt-2"
                expand="lg"
                variant="dark"
              >
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
                        <i className="tim-icons icon-badge mr-1" />
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
                        <i className="tim-icons icon-bag-16 mr-1" />
                        NFTs
                      </Button>
                    </Nav.Item>
                    <Nav.Item as="li">
                      <Button
                        className={classNames("btn-link", {
                          selected: contentDisplaying === Content.Sponsorships,
                        })}
                        variant="info"
                        onClick={() =>
                          setContentDisplaying(Content.Sponsorships)
                        }
                      >
                        <i className="tim-icons icon-spaceship mr-1" />
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
              <NFTGallery
                nftsIds={stallNFTClasses.map((nftClass: BigNumber) =>
                  nftClass.shl(128)
                )}
              />
            )}
            {contentDisplaying === Content.Sponsorships && (
              <SponsorshipGallery
                sponsorshipsIds={sponsorshipsIds}
                stallId={stallId}
                setContentDisplaying={setContentDisplaying}
              />
            )}
            {contentDisplaying === Content.NewNFT &&
              vendorAddress &&
              vendorAddress === account && (
                <NewNFT setContentDisplaying={setContentDisplaying} />
              )}
            {contentDisplaying === Content.NewSponsorship &&
              vendorAddress &&
              vendorAddress === account && (
                <NewSponsorship setContentDisplaying={setContentDisplaying} />
              )}
          </div>
        </div>
      </Container>
    </LoadingContainer>
  );
}

export default Profile;
