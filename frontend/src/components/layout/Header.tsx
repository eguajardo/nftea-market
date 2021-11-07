import { useContractCall, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";
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
          <Navbar.Brand href="/">NFTea•Market</Navbar.Brand>
          <Navbar.Toggle aria-controls="navigation">
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </Navbar.Toggle>
          <Navbar.Collapse>
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <a href="/">NFTea•Market</a>
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
                <Nav.Link href="/">Explore</Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                {account && (
                  <Nav.Link href="/collection">My collection</Nav.Link>
                )}
              </Nav.Item>
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
                      Connect
                      <i className="tim-icons icon-single-02 ml-2" />
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
