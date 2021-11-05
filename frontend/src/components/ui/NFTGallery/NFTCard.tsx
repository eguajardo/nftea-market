import { Card, Image } from "react-bootstrap";
import { NFTData } from "types/metadata";

type Properties = NFTData & {
  onSelect: Function;
};

function NFTCard({ onSelect, ...nft }: Properties) {
  const handleSelect = () => {
    onSelect(nft);
  };

  return (
    <Card className="card-product">
      <div className="card-image" onClick={handleSelect}>
        <Image src={nft.image} className="align-middle" />
      </div>
      <Card.Body>
        <a href="#pablo">
          <Card.Title as="h4">{nft.name}</Card.Title>
        </a>
        <Card.Footer>
          <div className="price-container">
            <span className="price">
              ${(nft.price.toNumber() / 100).toFixed(2)} USD
            </span>
          </div>
          <div>
            <span className="supply">
              Supply:{" "}
              {nft.maxSupply.isZero() ? "unlimited" : nft.maxSupply.toString()}
            </span>
          </div>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
}

export default NFTCard;
