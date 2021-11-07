import { Button, Card, Image, ProgressBar } from "react-bootstrap";
import { SponsorshipData } from "types/metadata";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";

type Properties = SponsorshipData & {
  onSelect: Function;
};

const classNames = require("classnames");

function SponsorshipCard({ onSelect, ...sponsorship }: Properties) {
  const remaining =
    sponsorship.deadline.mul(1000).toNumber() - new Date().getTime();
  const daysLeft = Math.floor(remaining / 1000 / 60 / 60 / 24); // convert miliseconds to days

  const percent = Math.floor(
    (sponsorship.totalFunds.toNumber() /
      sponsorship.requestedAmount.toNumber()) *
      100
  );

  const handleSelect = () => {
    onSelect(sponsorship);
  };

  return (
    <Card className="card-blog">
      <div className="card-image">
        <Image
          alt=""
          className="img rounded"
          src={sponsorship.image}
          onClick={handleSelect}
        />
      </div>
      <Card.Body>
        <Card.Title as="h5" onClick={handleSelect}>
          <Button className="btn-link" variant="info">
            {sponsorship.name}
          </Button>
        </Card.Title>
        <div className="completion-bar">
          <ProgressBar
            now={percent}
            variant={percent >= 100 ? "primary" : "warning"}
          />
          <div className="ml-2">{percent}%</div>
        </div>
        <Card.Footer>
          <div className="stats stats-right">
            <i className="tim-icons icon-coins mr-2" />
            <span
              className={classNames("mr-2", {
                "text-primary": sponsorship.totalFunds.gte(
                  sponsorship.requestedAmount
                ),
                "text-warning": sponsorship.totalFunds.lt(
                  sponsorship.requestedAmount
                ),
              })}
            >
              ${(sponsorship.totalFunds.toNumber() / 100).toFixed(2)}
            </span>
            of ${(sponsorship.requestedAmount.toNumber() / 100).toFixed(2)}
            <FontAwesomeIcon icon={faUserFriends} className="ml-4 mr-2" />
            {sponsorship.sponsorsQuantity.toString()}
            <i className="tim-icons icon-calendar-60 mr-2 ml-4" />
            <span>{daysLeft} days left</span>
            <span></span>
          </div>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
}

export default SponsorshipCard;
