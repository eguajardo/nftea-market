import { Button, Col, Row, Image } from "react-bootstrap";
import { NFTData } from "types/metadata";

function NFTView(nft: NFTData) {
  return (
    <div>
      <Row>
        <Col lg="6" md="12">
          <Image src={nft.image} className="align-middle" />
        </Col>
        <Col className="mx-auto" lg="6" md="12">
          <h2 className="title">{nft.name}</h2>
          <h2 className="main-price">
            <div>${nft.price.div(100).toNumber().toFixed(2)} USD</div>
            <h4 className="mt-1">
              Supply:{" "}
              {nft.supply.isZero() ? "unlimited" : nft.supply.toString()}
            </h4>
          </h2>
          <h5 className="category">Description</h5>
          <p className="description">{nft.description}</p>
          <Row className="justify-content-start mt-4">
            <Button className="ml-3" color="warning">
              <i className="tim-icons icon-cart mr-2" />
              Buy 
            </Button>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default NFTView;
