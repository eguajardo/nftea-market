import { useEthers } from "@usedapp/core";
import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";

function Header() {
  const { activateBrowserWallet, account } = useEthers();

  const connect = () => {
    activateBrowserWallet();
  };

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
              <Nav.Item>
                {!account && (
                  <Button
                    className="nav-link "
                    color="default"
                    onClick={connect}
                    size="sm"
                    target="_blank"
                    variant="warning"
                  >
                    <p>Connect</p>
                  </Button>
                )}
                {account && (
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
