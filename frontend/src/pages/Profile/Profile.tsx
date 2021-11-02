import { getJSONMetadata } from "helpers/ipfs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContractCall } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { Market } from "types/typechain";

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
import { Metadata } from "types/metadata";

enum MenuOption {
  About,
  NFTeas,
  Sponsorships,
}

const classNames = require("classnames");

function Profile() {
  console.log("render Profile");
  const { stallId } = useParams<{ stallId: string }>();
  const marketContract: Market = useContract("Market")!;
  const [metadata, setMetadata] = useState<Metadata>();
  const [menuOption, setMenuOption] = useState<MenuOption>(MenuOption.About);

  const [stallUri] =
    useContractCall(
      marketContract &&
        stallId && {
          abi: marketContract.interface,
          address: marketContract.address,
          method: "uri",
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
      ></div>
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
                        selected: menuOption === MenuOption.About,
                      })}
                      variant="info"
                      onClick={() => setMenuOption(MenuOption.About)}
                    >
                      About
                    </Button>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Button
                      className={classNames("btn-link", {
                        selected: menuOption === MenuOption.NFTeas,
                      })}
                      variant="info"
                      onClick={() => setMenuOption(MenuOption.NFTeas)}
                    >
                      NFTeas
                    </Button>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Button
                      className={classNames("btn-link", {
                        selected: menuOption === MenuOption.Sponsorships,
                      })}
                      variant="info"
                      onClick={() => setMenuOption(MenuOption.Sponsorships)}
                    >
                      Sponsorships
                    </Button>
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
          </Col>
        </Row>
        <Row>
          <Col md={3} xs={12}></Col>
          <Col md={9} xs={12}>
            {menuOption === MenuOption.About && (
              <div className="mt-2">{metadata?.description}</div>
            )}
          </Col>
        </Row>
      </div>
    </Container>
  );
}

export default Profile;
