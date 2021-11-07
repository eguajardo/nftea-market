import { useEffect, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import useFormAlert from "hooks/useFormAlert";
import useAuthorizationSignature from "hooks/useAuthorizationSignature";
import { createSubmissionHandler } from "helpers/submissionHandler";
import { Button, Col, Row, Image } from "react-bootstrap";
import { SponsorshipData } from "types/metadata";
import { SponsorshipEscrow } from "types/typechain";
import { FormProcessingStatus, FormState } from "types/forms";
import { BigNumber } from "ethers";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";

const AMOUNT = 105; // 100.00 USD

function SponsorshipView(sponsorship: SponsorshipData) {
  const [formState, setFormState] = useState<FormState>({});
  const { Alert } = useFormAlert(formState);

  const escrowContract: SponsorshipEscrow =
    useContract<SponsorshipEscrow>("SponsorshipEscrow")!;
  const { account, library } = useEthers();

  const { state: depositState, send: sendDeposit } = useContractFunction(
    escrowContract,
    "deposit"
  );

  const { signAuthorization, fiatToStablecoin } = useAuthorizationSignature();

  const onSubmit = async () => {
    if (!account || !library) {
      Alert.fire({
        icon: "warning",
        title: "Please connect your wallet first",
      });
      return;
    }

    depositState.status = "None";
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
              ${(AMOUNT / 100).toFixed(2)} USD
            </span>{" "}
            should appear as{" "}
            <span className="text-warning">
              {fiatToStablecoin(BigNumber.from(AMOUNT)).toString()}
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
      value: AMOUNT,
    });

    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Sending contribution...",
    });

    sendDeposit(
      sponsorship.sponsorshipId,
      fiatToStablecoin(BigNumber.from(AMOUNT)),
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

  return (
    <div>
      <Row>
        <Col lg="6" md="12">
          <Image src={sponsorship.image} className="align-middle" />
        </Col>
        <Col className="mx-auto nft-details" lg="6" md="12">
          <h2 className="title">{sponsorship.name}</h2>
          <h2 className="main-price">
            <div className="text-primary">
              ${(sponsorship.price.toNumber() / 100).toFixed(2)} USD
            </div>
            <span className="mt-1 supply">
              Max supply:{" "}
              {sponsorship.maxSupply.isZero()
                ? "unlimited"
                : sponsorship.maxSupply.toString()}
            </span>
          </h2>
          <h5 className="category">Description</h5>
          <p className="description">{sponsorship.description}</p>
          <Row className="justify-content-start mt-4">
            <Button
              className="ml-3"
              color="warning"
              onClick={createSubmissionHandler(onSubmit, onSubmitError)}
            >
              <FontAwesomeIcon icon={faCoins} className="mr-2" />
              Send contribution
            </Button>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default SponsorshipView;
