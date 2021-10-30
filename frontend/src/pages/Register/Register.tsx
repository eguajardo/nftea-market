import { Card, Col, Container, Row } from "react-bootstrap";
import RegisterForm from "./RegisterForm";
import SquareImage from "theme/assets/img/square1.png";
import RegisterBackground from "./RegisterBackground";

function Register() {
  return (
    <div>
      <RegisterBackground />
      <Container>
        <Row>
          <Col className="mx-auto" lg="7" md="12">
            <Card className="card-register">
              <Card.Header>
                <Card.Img alt="" src={SquareImage}></Card.Img>
                <Card.Title as="h4">Register</Card.Title>
              </Card.Header>
              <Card.Body>
                <RegisterForm />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;
