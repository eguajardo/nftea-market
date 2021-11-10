import { useContractCall, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { Fragment } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { Market } from "types/typechain";

function Header() {
  const { activateBrowserWallet, account } = useEthers();
  const marketContract: Market = useContract("Market")!;

  const connect = () => {
    activateBrowserWallet();
  };

  const [stallUri] =
    useContractCall(
      marketContract &&
        account && {
          abi: marketContract.interface,
          address: marketContract.address,
          method: "uriOrEmpty",
          args: [account],
        }
    ) ?? [];

  console.log("account", account);
  console.log("stallUri", stallUri);

  return (
    <div>
      <Navbar bg="default" expand="lg" variant="dark">
        <Container>
          <Link className="navbar-brand" to="/">
            NFTea•Market
          </Link>
          <Navbar.Toggle aria-controls="navigation">
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </Navbar.Toggle>
          <Navbar.Collapse>
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <Link to="/">NFTea•Market</Link>
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
                <NavLink className="nav-link" to="/explore">
                  Explore
                </NavLink>
              </Nav.Item>
              {account && (
                <Fragment>
                  <Nav.Item as="li">
                    <NavLink className="nav-link" to="/collection">
                      My collection
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <NavLink className="nav-link" to="/sponsored">
                      My sponsored NFTs
                    </NavLink>
                  </Nav.Item>
                </Fragment>
              )}
              <Nav.Item>
                {!account && (
                  <Button
                    className="nav-link "
                    color="default"
                    onClick={connect}
                    size="sm"
                    variant="warning"
                  >
                    <p>
                      <i className="tim-icons icon-single-02 mr-2" />
                      Connect
                    </p>
                  </Button>
                )}
                {account && !stallUri && (
                  <NavLink to="/register" className="btn btn-warning btn-sm">
                    <p>Open NFT Stall</p>
                  </NavLink>
                )}
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;
