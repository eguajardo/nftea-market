import { Button, Card, Image } from "react-bootstrap";
import { StallData } from "types/metadata";

type Properties = StallData & {
  onSelect: Function;
};

const MAX_DESCRIPTION_LENGTH = 75;

function StallCard({ onSelect, ...stall }: Properties) {
  const shortDescription =
    stall.description.length > MAX_DESCRIPTION_LENGTH
      ? stall.description.slice(0, MAX_DESCRIPTION_LENGTH - 1) + "…"
      : stall.description;

  const handleSelect = () => {
    onSelect(stall);
  };

  return (
    <Card className="card-profile profile-bg">
      <Card.Header
        onClick={handleSelect}
        style={{
          backgroundImage: `url(${stall.headerImage})`,
        }}
      >
        <div className="card-avatar">
          <Image
            alt=""
            onClick={handleSelect}
            className="img img-raised"
            src={stall.image}
          />
        </div>
      </Card.Header>
      <Card.Body>
        <Card.Title as="h3" onClick={handleSelect}>
          <Button className="btn-link" variant="info">
            {stall.name}
          </Button>
        </Card.Title>
        <p className="card-description">{shortDescription}</p>
      </Card.Body>
    </Card>
  );
}

export default StallCard;
