import { useCallback, useEffect, useState } from "react";
import { useContractCall, useContractFunction, useEthers } from "@usedapp/core";
import { useParams } from "react-router-dom";
import { useContract } from "hooks/useContract";
import { useFormFields } from "hooks/useFormFields";
import useFormAlert from "hooks/useFormAlert";
import useAuthorizationSignature from "hooks/useAuthorizationSignature";
import { createSubmissionHandler } from "helpers/submissionHandler";
import { Button, Col, Row, Image, ProgressBar } from "react-bootstrap";
import { SponsorshipData } from "types/metadata";
import { Market, SponsorshipEscrow } from "types/typechain";
import { FormProcessingStatus, FormState } from "types/forms";
import { BigNumber } from "ethers";
import { Content } from "pages/Profile/Profile";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import FormGroup from "../FormGroup/FormGroup";

const classNames = require("classnames");

type Properties = SponsorshipData & {
  setContentDisplaying: React.Dispatch<React.SetStateAction<Content>>;
  setIsFinalizing: React.Dispatch<React.SetStateAction<boolean>>;
};

function SponsorshipView({
  setContentDisplaying,
  setIsFinalizing,
  ...sponsorship
}: Properties) {
  const {
    formFields,
    createValueChangeHandler,
    createInputBlurHandler,
    validateForm,
    hasError,
  } = useFormFields(
    new Map([
      [
        "amount",
        {
          type: "number",
          id: "amount",
          label: "Contribution amount",
          step: 0.01,
          prepend: "$",
          append: "USD",
          validator: (field) => {
            if (!field.value || field.value <= 0) {
              return "Amount must be greater than zero!";
            }

            return null;
          },
        },
      ],
    ])
  );

  const { stallId } = useParams<{ stallId: string }>();
  const [formState, setFormState] = useState<FormState>({});
  const { Alert, successAlertResult } = useFormAlert(formState);

  const marketContract: Market = useContract<Market>("Market")!;
  const escrowContract: SponsorshipEscrow =
    useContract<SponsorshipEscrow>("SponsorshipEscrow")!;
  const { account, library } = useEthers();

  const [vendorAddress] =
    useContractCall(
      marketContract &&
        stallId && {
          abi: marketContract.interface,
          address: marketContract.address,
          method: "stallVendor",
          args: [stallId],
        }
    ) ?? [];

  const { state: depositState, send: sendDeposit } = useContractFunction(
    escrowContract,
    "deposit"
  );

  const { signAuthorization, fiatToStablecoin } = useAuthorizationSignature();

  const remaining =
    sponsorship.deadline.mul(1000).toNumber() - new Date().getTime();
  const daysLeft = Math.floor(remaining / 1000 / 60 / 60 / 24); // convert miliseconds to days

  const percent = sponsorship.requestedAmount.isZero()
    ? 100
    : Math.floor(
        (sponsorship.totalFunds.toNumber() /
          sponsorship.requestedAmount.toNumber()) *
          100
      );

  const onSubmit = async () => {
    if (!account || !library) {
      Alert.fire({
        icon: "warning",
        title: "Please connect your wallet first",
      });
      return;
    }

    depositState.status = "None";
    const amountCents = Math.round(formFields.get("amount")!.value * 100);
    Alert.fire({
      icon: "warning",
      title: "Signing...",
      html: (
        <div>
          <div>
            Before signing, please verify the URL in your browser navigation bar
            is the correct one
          </div>
          <div className="mt-4">
            Value{" "}
            <span className="text-primary">
              ${(amountCents / 100).toFixed(2)} USD
            </span>{" "}
            should appear as{" "}
            <span className="text-warning">
              {fiatToStablecoin(BigNumber.from(amountCents)).toString()}
            </span>{" "}
            in the signature request
          </div>
        </div>
      ),
      didOpen: () => {
        Alert.showLoading();
      },
    });

    console.log("library", library, library.getSigner());
    const { v, r, s, nonce, validBefore } = await signAuthorization(library, {
      from: account,
      to: escrowContract.address,
      value: BigNumber.from(amountCents),
    });

    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Sending contribution...",
    });

    sendDeposit(
      sponsorship.sponsorshipId,
      fiatToStablecoin(BigNumber.from(amountCents)),
      nonce,
      validBefore,
      v,
      r,
      s
    );
  };

  const onSubmitError = async (err: any) => {
    setFormState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  useEffect(() => {
    if (depositState && formState.status === FormProcessingStatus.Processing) {
      switch (depositState.status) {
        case "Success":
          console.log("NFT created");
          setFormState({
            status: FormProcessingStatus.Success,
            statusMessage: "Contribution received!",
          });
          break;
        case "Exception":
        case "Fail":
          setFormState({
            status: FormProcessingStatus.Error,
            statusMessage: depositState.errorMessage,
          });
          console.error("Transaction Error:", depositState.errorMessage);
          break;
      }
    }
  }, [depositState, formState.status]);

  const waitSuccessAlertDismiss = useCallback(async () => {
    if (
      formState.status === FormProcessingStatus.Success &&
      successAlertResult
    ) {
      setContentDisplaying(Content.About);
    }
  }, [formState.status, setContentDisplaying, successAlertResult]);

  useEffect(() => {
    waitSuccessAlertDismiss();
  }, [waitSuccessAlertDismiss]);

  const onFulfillClick = () => {
    setIsFinalizing(true);
  };

  return (
    <div>
      <Row>
        <Col lg="6" md="12">
          <Image src={sponsorship.image} className="align-middle" />
        </Col>
        <Col className="mx-auto sponsorship-details" lg="6" md="12">
          <h2 className="title">{sponsorship.name}</h2>
          <h2 className="main-info">
            <div>
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
              of ${(sponsorship.requestedAmount.toNumber() / 100).toFixed(2)}{" "}
              funded{" "}
              {vendorAddress === account && percent >= 100 && (
                <Button
                  className="btn-simple btn-warning"
                  onClick={onFulfillClick}
                >
                  Fulfill and Claim
                </Button>
              )}
            </div>
            <div className="completion-bar">
              <ProgressBar
                now={percent}
                variant={percent >= 100 ? "primary" : "warning"}
              />
              <div className="ml-2">{percent}%</div>
            </div>
            <div className="subdetails mb-3">
              <FontAwesomeIcon icon={faUserFriends} className="mr-2" />
              {sponsorship.sponsorsQuantity.toString()} contributors
              <i className="tim-icons icon-calendar-60 mr-2 ml-4" />
              <span>{daysLeft} days left</span>
            </div>
            <div className="nft-details subdetails">
              <div>
                <span className="text-primary">
                  <i className="tim-icons icon-money-coins mr-2" />$
                  {(sponsorship.price.toNumber() / 100).toFixed(2)} USD
                </span>{" "}
                will be the cost of the target NFT
              </div>
              <div>
                <span className="text-primary">
                  <i className="tim-icons icon-chart-pie-36 mr-2" />%
                  {(sponsorship.sponsorsShares.toNumber() / 100).toFixed(2)}
                </span>{" "}
                of sales will be divided proportionally among all sponsors
              </div>
              <div>
                <span className="text-primary">
                  <i className="tim-icons icon-single-copy-04 mr-2" />
                  {sponsorship.maxSupply.isZero()
                    ? "unlimited"
                    : sponsorship.maxSupply.toNumber()}
                </span>{" "}
                number of copies will be available for sale
              </div>
            </div>
          </h2>
          <h5 className="category">Description</h5>
          <p className="description">{sponsorship.description}</p>
          <form className="mt-4">
            <Row className="justify-content-start mt-4 contribution-form">
              <Col>
                <FormGroup
                  key={formFields.get("amount")!.id}
                  field={formFields.get("amount")!}
                  onChange={createValueChangeHandler(formFields.get("amount")!)}
                  onBlur={createInputBlurHandler(formFields.get("amount")!)}
                  error={hasError(formFields.get("amount")!)}
                />
              </Col>
              <Col>
                <Button
                  className="ml-3 mb-3"
                  color="warning"
                  onClick={createSubmissionHandler(
                    onSubmit,
                    onSubmitError,
                    validateForm
                  )}
                >
                  <FontAwesomeIcon icon={faCoins} className="mr-2" />
                  Send contribution
                </Button>
              </Col>
            </Row>
          </form>
        </Col>
      </Row>
    </div>
  );
}

export default SponsorshipView;
