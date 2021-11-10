import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useEthers } from "@usedapp/core";
import { useFormFields } from "hooks/useFormFields";
import { useContract } from "hooks/useContract";
import { parseLogValue } from "helpers/logs";

import { Market } from "types/typechain";

import { Button, Col, Container, Row, Image } from "react-bootstrap";
import FormGroup from "components/ui/FormGroup/FormGroup";
import StallGallery from "components/ui/StallGallery/StallGallery";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTree } from "@fortawesome/free-solid-svg-icons";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons";
import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { faHandHoldingUsd } from "@fortawesome/free-solid-svg-icons";

import headerImage from "assets/img/lisheng-chang-M2524ncJQ40-unsplash.jpg";
import shapeSImage from "theme/assets/img/shape-s.png";
import poweredByImage from "assets/img/powered-by-polygon.png";
import path2Image from "theme/assets/img/path2.png";
import path5Image from "theme/assets/img/path5.png";
import environmentImage from "assets/img/markus-spiske-GnxktpZHjcM-unsplash.jpg";
import sponsorshipDemo from "assets/img/sponsorship-demo.png";

import "./style.scss";

function Home() {
  console.log("render Home");
  const {
    formFields,
    createValueChangeHandler,
    createInputBlurHandler,
    hasError,
  } = useFormFields(
    new Map([
      [
        "username",
        {
          type: "text",
          id: "username",
          placeholder: "yourname",
          prepend: "https://nftea.market.com/",
          validator: (field): string | null => {
            return null;
          },
        },
      ],
    ])
  );

  const routerHistory = useHistory();

  const { library } = useEthers();
  const marketContract: Market = useContract<Market>("Market")!;
  const [stallIds, setStallsIds] = useState<string[]>([]);

  const loadStalls = useCallback(async () => {
    if (!library || !marketContract) {
      return;
    }

    const stallsFilter = marketContract.filters.StallRegistration();
    const loadedStalls = await parseLogValue<string>(
      stallsFilter,
      library,
      marketContract.interface,
      3
    );

    const startPosition = loadedStalls.length > 3 ? loadedStalls.length - 3 : 0;
    setStallsIds(loadedStalls.slice(startPosition));
  }, [library, marketContract]);

  useEffect(() => {
    loadStalls();
  }, [loadStalls]);

  const getStarted = () => {
    const path = formFields.get("username")?.value
      ? `/register/${formFields.get("username")!.value}`
      : "/register";
    routerHistory.push(path);
  };

  return (
    <div>
      <div className="page-header">
        <div className="content-center">
          <Container>
            <Row className="align-items-center text-left">
              <Col lg="6" xs="12">
                <h1 className="title">
                  Transform your passion into <br />
                  <strong className="text-info">
                    Digital collectibles for your fans
                  </strong>
                </h1>
                <p className="description">
                  Open a digital stall in the NFTea Market and allow your fans
                  to collect and sponsor your work. Instead of receiving coffee
                  donations, offer your fans a cup of NFTea and{" "}
                  <span className="font-weight-bold">
                    start financing your passion!
                  </span>
                </p>
                <form onSubmit={getStarted}>
                  <Row className="row-input">
                    <Col className="mt-2" sm="8" xs="12">
                      <FormGroup
                        key={formFields.get("username")!.id}
                        field={formFields.get("username")!}
                        onChange={createValueChangeHandler(
                          formFields.get("username")!
                        )}
                        onBlur={createInputBlurHandler(
                          formFields.get("username")!
                        )}
                        error={hasError(formFields.get("username")!)}
                      />
                    </Col>
                    <Col sm="4" xs="12">
                      <Button type="submit" variant="warning">
                        Open stall
                      </Button>
                    </Col>
                  </Row>
                </form>
              </Col>
              <Col lg="6" xs="12">
                <img alt="" className="path path3" src={shapeSImage} />
                {/* SVG Illustration */}
                <figure className=" header-shape">
                  <svg
                    className=" injected-svg js-svg-injector"
                    enableBackground="new 10 12 878.9 907"
                    viewBox="10 12 878.9 907"
                    x="0px"
                    y="0px"
                    xmlSpace="preserve"
                  >
                    <g>
                      <defs>
                        <path
                          d="M300.34,75.35C379.42-7.43,305.86,185.78,540.87,98.95,647.68,46,677,219,674.65,258.55c-11,185-132.32,65-13.89,317.66,56.86,121.32-94.88,256-155.89,151.41-55.11-94.48-151.56-85.1-189-90.54-311-45.27-9.33-148.52-125.21-256.78C9.7,211.2,190.5,100.86,306.34,70.35Z"
                          id="shape1"
                        />
                      </defs>
                      <clipPath id="shape2">
                        <use
                          style={{ overflow: "visible" }}
                          xlinkHref="#shape1"
                        />
                      </clipPath>
                      <g clipPath="url(#shape2)">
                        <image
                          height="900"
                          id="imageShape1"
                          style={{ overflow: "visible" }}
                          transform="matrix(0.9488 0 0 0.9488 25 53.1187)"
                          width="800"
                          xlinkHref={headerImage}
                        />
                      </g>
                    </g>
                    <g>
                      <defs>
                        <path
                          d="M186.26,647.36c7,1,14,1.87,21.11,2.4,42.73,3.24,173.84,9.32,234.51,60.15,72.83,61,105.38,80.19,37.4,96.45C388.73,828,438.49,724,312,749.28c-167.3,33.46-210.61-70.86-181.08-90.54C151.8,644.8,174.69,645.67,186.26,647.36Z"
                          id="shape3"
                        />
                      </defs>
                      <clipPath id="shape4">
                        <use
                          style={{ overflow: "visible" }}
                          xlinkHref="#shape3"
                        />
                      </clipPath>
                      <g
                        clipPath="url(#shape4)"
                        transform="matrix(1 0 0 1 0 0)"
                      >
                        <image
                          height="900"
                          id="imageShape2"
                          style={{ overflow: "visible" }}
                          transform="matrix(0.9488 0 0 0.9488 25 53.1187)"
                          width="900"
                          xlinkHref={headerImage}
                        />
                      </g>
                    </g>
                  </svg>
                </figure>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <section className="section section-lg section-safe awesome-features">
        <img alt="" className="path" src={path5Image} />
        <Container>
          <Row className="row-grid justify-content-between">
            <Col md="6">
              <img
                alt=""
                className="img-fluid floating"
                src={sponsorshipDemo}
              />
            </Col>
            <Col md="6">
              <div className="px-md-5">
                <hr className="line-success" />
                <h3>Awesome features</h3>
                <p>
                  You can make as many NFT copies as you want out of whatever
                  work you have already done, or engage with your fans by
                  requesting a sponsorship to finance your project and reward
                  them with sale comissions of a selected NFT
                </p>
                <ul className="list-unstyled mt-5">
                  <li className="py-2">
                    <div className="d-flex">
                      <div className="icon icon-success mb-2">
                        <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                      </div>
                      <div className="ml-3">
                        <h3>Payments using a USD stablecoin</h3>
                      </div>
                    </div>
                  </li>
                  <li className="py-2">
                    <div className="d-flex">
                      <div className="icon icon-success mb-2">
                        <FontAwesomeIcon
                          icon={faHandHoldingUsd}
                          className="mr-2"
                        />
                      </div>
                      <div className="ml-3">
                        <h3>Reward your sponsors with sale comissions</h3>
                      </div>
                    </div>
                  </li>
                  <li className="py-2">
                    <div className="d-flex">
                      <div className="icon icon-success mb-2">
                        <FontAwesomeIcon
                          icon={faFingerprint}
                          className="mr-2"
                        />
                      </div>
                      <div className="ml-3">
                        <h3>
                          Each NFT, whether a copy or not, has a serial number
                        </h3>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <section className="features-explore">
        <Container>
          <Row className="text-center mb-2">
            <Col className="ml-auto mr-auto" md="8">
              <h2>
                Explore the market stalls already paving the{" "}
                <span className="text-warning">future of digital content</span>
              </h2>
            </Col>
          </Row>
          {stallIds && <StallGallery stallIds={stallIds} />}
          <Row className="text-center mt-5">
            <Col className="ml-auto mr-auto" md="8">
              <h2>
                Be part of the <span className="text-warning">NFT</span>{" "}
                revolution
              </h2>
              <form onSubmit={getStarted}>
                <div className="d-inline-block">
                  <FormGroup
                    key={formFields.get("username")!.id}
                    field={formFields.get("username")!}
                    onChange={createValueChangeHandler(
                      formFields.get("username")!
                    )}
                    onBlur={createInputBlurHandler(formFields.get("username")!)}
                    error={hasError(formFields.get("username")!)}
                  />
                </div>
                <Button
                  type="submit"
                  variant="warning"
                  className="d-inline-block ml-4"
                >
                  Open stall
                </Button>
              </form>
            </Col>
          </Row>
        </Container>
      </section>
      <div className="features-6">
        <Container className="mt-4">
          <Row className="text-center">
            <Col className="ml-auto mr-auto" md="8">
              <Image src={poweredByImage} />
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col lg="6">
              <div className="info info-horizontal info-default">
                <div className="icon icon-primary">
                  <FontAwesomeIcon icon={faTree} className="mr-2" />
                </div>
                <div className="description">
                  <h3 className="info-title">Eco-friendly</h3>
                  <p>
                    We care for the environment, therefore all our NFTs are
                    created using an environmentally friendly blockchain which
                    doesn't waste massive amounts of energy with outdated
                    algorithms.
                  </p>
                </div>
              </div>
              <div className="info info-horizontal info-default">
                <div className="icon icon-success">
                  <FontAwesomeIcon icon={faPiggyBank} className="mr-2" />
                </div>
                <div className="description">
                  <h3 className="info-title">Almost free transactions</h3>
                  <p>
                    Transaction fees on the Polygon blockchain cost less than a
                    cent, which is absurdly cheap in comparison to payment
                    processors like Paypal. Less fees, more income for you!
                  </p>
                </div>
              </div>
              <div className="info info-horizontal info-default">
                <div className="icon icon-info">
                  <FontAwesomeIcon icon={faBolt} className="mr-2" />
                </div>
                <div className="description">
                  <h3 className="info-title">Lighting Fast</h3>
                  <p>
                    No need to wait minutes before a transaction is finalized.
                    Unlike other blockchains, Polygon's scaling solution allows
                    transactions to be finalized in seconds.
                  </p>
                </div>
              </div>
            </Col>
            <Col lg="6" xs="10">
              <img alt="" className="shape" src={path2Image} />
              <figure className="ie-non-standard-hero-shape">
                <svg
                  className="injected-svg js-svg-injector"
                  enableBackground="new 10 12 878.9 907"
                  viewBox="10 12 878.9 907"
                  x="0px"
                  y="0px"
                  xmlSpace="preserve"
                >
                  <g>
                    <defs>
                      <path
                        d="M329.15,403.44c30.22-62,26.51-223.94,94.06-268.46C479,98.23,560.16,257,700.68,151.61c71.25-53.44,85.54,81,160.38,172.6C1008.5,504.74,881.5,639.14,825.35,686.6c-62.54,52.85-246.14,24.42-386.7,79.28S214.07,834,202.07,702C190.39,573.57,288.69,486.43,329.15,403.44Z"
                        id="firstShape"
                      />
                    </defs>
                    <clipPath id="secondShape">
                      <use
                        style={{ overflow: "visible" }}
                        xlinkHref="#firstShape"
                      />
                    </clipPath>
                    <g clipPath="url(#secondShape)">
                      <image
                        height="900"
                        id="imageShape1"
                        style={{ overflow: "visible" }}
                        transform="matrix(0.9488 0 0 0.9488 25 53.1187)"
                        width="900"
                        xlinkHref={environmentImage}
                      />
                    </g>
                  </g>
                  <g>
                    <defs>
                      <path
                        d="M337.17,855.62c-7.81-35.46,42.38-43.95,63.66-52.44,24.39-9.74,135.86-48,192.58-52.52,64.22-5.13,190.21-26.84,160.46,35.34-19.76,41.3-51.47,64.52-87.63,62.33-46.36-2.81-101.56,4.39-150.8,44C448.53,946.08,450.93,865,412,868,372.28,871,340.79,872.08,337.17,855.62Z"
                        id="thirdShape"
                      />
                    </defs>
                    <clipPath id="fourthShape">
                      <use
                        style={{ overflow: "visible" }}
                        xlinkHref="#thirdShape"
                      />
                    </clipPath>
                    <g
                      clipPath="url(#fourthShape)"
                      transform="matrix(1 0 0 1 0 0)"
                    >
                      <image
                        height="1000"
                        id="imageShape2"
                        style={{ overflow: "visible" }}
                        transform="matrix(0.9488 0 0 0.9488 25 53.1187)"
                        width="900"
                        xlinkHref={environmentImage}
                      />
                    </g>
                  </g>
                </svg>
              </figure>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default Home;
