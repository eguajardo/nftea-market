import { Fragment } from "react";
import { Button, Card, Image } from "react-bootstrap";
import { NFTData } from "types/metadata";

type Properties = NFTData & {
  onSelect: Function;
};

function NFTCard({ onSelect, ...nft }: Properties) {
  const handleSelect = () => {
    onSelect(nft);
  };

  console.log("SERIAL", nft.serial.toString());

  return (
    <Card className="card-product">
      <div className="card-image" onClick={handleSelect}>
        <Image src={nft.image} className="align-middle" />
      </div>
      <Card.Body>
        <Card.Title as="h4" onClick={handleSelect}>
          <Button className="btn-link" variant="info">
            {nft.name}
          </Button>
        </Card.Title>
        {nft.serial.isZero() && (
          <Fragment>
            <Card.Footer>
              <div className="price-container">
                <i className="tim-icons icon-money-coins mr-2" />
                <span className="price">
                  ${(nft.price.toNumber() / 100).toFixed(2)} USD
                </span>
              </div>
            </Card.Footer>
            <Card.Footer>
              <div>
                <i className="tim-icons icon-single-copy-04 mr-2" />
                <span className="mr-2">{nft.totalSerialized.toString()}</span>
                <span className="mr-2">sold out of</span>
                <span className="supply">
                  {nft.maxSupply.isZero()
                    ? "unlimited"
                    : nft.maxSupply.toString()}
                </span>
              </div>
            </Card.Footer>
          </Fragment>
        )}
        {!nft.serial.isZero() && (
          <Card.Footer>
            <div className="serial-container">
              <span className="mr-1">#</span>
              <span className="serial">{nft.serial.toString()}</span>
              <span className="ml-1">
                /{" "}
                {nft.maxSupply.isZero()
                  ? "unlimited"
                  : nft.maxSupply.toString()}
              </span>
            </div>
          </Card.Footer>
        )}
      </Card.Body>
    </Card>
  );
}

export default NFTCard;
