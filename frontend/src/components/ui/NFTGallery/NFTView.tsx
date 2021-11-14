import { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useContractCall, useContractFunction, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import useFormAlert from "hooks/useFormAlert";
import useAuthorizationSignature from "hooks/useAuthorizationSignature";
import { parseLogValue } from "helpers/logs";
import { fiatToStablecoin, stablecoinToFiat } from "helpers/currency";
import { createSubmissionHandler } from "helpers/submissionHandler";
import { Button, Col, Row, Image } from "react-bootstrap";
import { BigNumber } from "ethers";
import { NFTData } from "types/metadata";
import { Market, PaymentSplitter, SponsorshipEscrow } from "types/typechain";
import { FormProcessingStatus, FormState } from "types/forms";

function NFTView(nft: NFTData) {
  const routerHistory = useHistory();
  const [formState, setFormState] = useState<FormState>({});
  const [releaseState, setReleaseState] = useState<FormState>({});
  const [contribution, setContribution] = useState<number>();
  const { Alert, successAlertResult } = useFormAlert(formState);
  const { successAlertResult: successReleaseAlertResult } =
    useFormAlert(releaseState);

  const marketContract: Market = useContract<Market>("Market")!;
  const escrowContract: SponsorshipEscrow =
    useContract<SponsorshipEscrow>("SponsorshipEscrow")!;

  const [paymentAddress] =
    useContractCall(
      marketContract && {
        abi: marketContract.interface,
        address: marketContract.address,
        method: "paymentAddress",
        args: [nft.class],
      }
    ) ?? [];

  const splitterContract: PaymentSplitter = useContract<PaymentSplitter>(
    "PaymentSplitter",
    paymentAddress
  )!;

  const { account, library } = useEthers();

  const { state: buyNFTTxState, send: sendBuyNFT } = useContractFunction(
    marketContract,
    "buyNFT"
  );

  const { state: releaseTxState, send: sendRelease } = useContractFunction(
    splitterContract,
    "release(address,address)"
  );

  const { signAuthorization, currencyContract } = useAuthorizationSignature();
  console.log("contributions", contribution);
  const loadContributions = useCallback(async () => {
    if (!library || !marketContract || !escrowContract) {
      return;
    }

    const sponsoredFilter = marketContract.filters.SponsoredNFT(nft.class);
    const [sponsorshipId] = await parseLogValue<BigNumber>(
      sponsoredFilter,
      library,
      marketContract.interface,
      1
    );

    const depositsFilter = escrowContract.filters.Deposit(
      sponsorshipId,
      account
    );
    const deposits: BigNumber[] = await parseLogValue<BigNumber>(
      depositsFilter,
      library,
      escrowContract.interface,
      3
    );

    if (deposits.length !== 0) {
      const totalDepositStablecoin = Math.max(
        ...deposits.map((deposit) => deposit.toNumber())
      );

      setContribution(stablecoinToFiat(totalDepositStablecoin));
    } else {
      setContribution(0);
    }
  }, [account, escrowContract, library, marketContract, nft.class]);

  useEffect(() => {
    loadContributions();
  }, [loadContributions]);

  const onSubmit = async () => {
    if (!account || !library) {
      Alert.fire({
        icon: "warning",
        title: "Please connect your wallet first",
      });
      return;
    }

    buyNFTTxState.status = "None";
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
              ${(nft.price.toNumber() / 100).toFixed(2)} USD
            </span>{" "}
            should appear as{" "}
            <span className="text-warning">
              {fiatToStablecoin(nft.price).toString()}
            </span>{" "}
            in the signature request
          </div>
        </div>
      ),
      didOpen: () => {
        Alert.showLoading();
      },
    });

    const { v, r, s, nonce, validBefore } = await signAuthorization(library, {
      from: account,
      to: await marketContract.paymentAddress(nft.class),
      value: nft.price,
    });

    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Purchasing NFT...",
    });

    sendBuyNFT(nft.class, nonce, validBefore, v, r, s);
  };

  const onSubmitError = async (err: any) => {
    setFormState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  const onReleaseSubmit = async () => {
    if (!account || !library) {
      Alert.fire({
        icon: "warning",
        title: "Please connect your wallet first",
      });
      return;
    }

    releaseTxState.status = "None";
    setReleaseState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Claiming earnings...",
    });

    sendRelease(currencyContract.address, account);
  };

  const onReleaseSubmitError = async (err: any) => {
    setReleaseState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  useEffect(() => {
    if (buyNFTTxState && formState.status === FormProcessingStatus.Processing) {
      switch (buyNFTTxState.status) {
        case "Success":
          console.log("NFT created");
          setFormState({
            status: FormProcessingStatus.Success,
            statusMessage: "NFT purchased!",
          });
          break;
        case "Exception":
        case "Fail":
          setFormState({
            status: FormProcessingStatus.Error,
            statusMessage: buyNFTTxState.errorMessage,
          });
          console.error("Transaction Error:", buyNFTTxState.errorMessage);
          break;
      }
    }
  }, [buyNFTTxState, formState.status]);

  useEffect(() => {
    if (
      releaseTxState &&
      releaseState.status === FormProcessingStatus.Processing
    ) {
      switch (releaseTxState.status) {
        case "Success":
          console.log("Earnings claimed!");
          setReleaseState({
            status: FormProcessingStatus.Success,
            statusMessage: "Earnings claimed!",
          });
          break;
        case "Exception":
        case "Fail":
          setReleaseState({
            status: FormProcessingStatus.Error,
            statusMessage: releaseTxState.errorMessage,
          });
          console.error("Transaction Error:", releaseTxState.errorMessage);
          break;
      }
    }
  }, [releaseTxState, releaseState.status]);

  const waitSuccessAlertDismiss = useCallback(async () => {
    if (
      formState.status === FormProcessingStatus.Success &&
      successAlertResult
    ) {
      routerHistory.push("/collection");
    }
  }, [formState.status, routerHistory, successAlertResult]);

  useEffect(() => {
    waitSuccessAlertDismiss();
  }, [waitSuccessAlertDismiss]);

  const waitSuccessReleaseAlertDismiss = useCallback(async () => {
    if (
      releaseState.status === FormProcessingStatus.Success &&
      successReleaseAlertResult
    ) {
      routerHistory.push("/sponsored");
    }
  }, [releaseState.status, routerHistory, successReleaseAlertResult]);

  useEffect(() => {
    waitSuccessReleaseAlertDismiss();
  }, [waitSuccessReleaseAlertDismiss]);

  return (
    <div>
      <Row>
        <Col lg="6" md="12">
          <Image src={nft.image} className="align-middle" />
        </Col>
        <Col className="mx-auto nft-details" lg="6" md="12">
          <h2 className="title">{nft.name}</h2>
          {nft.serial.isZero() && (
            <h2 className="main-price">
              <div className="text-primary">
                ${(nft.price.toNumber() / 100).toFixed(2)} USD
              </div>
              <span className="mt-1 supply">
                Max supply:{" "}
                {nft.maxSupply.isZero()
                  ? "unlimited"
                  : nft.maxSupply.toString()}
              </span>

              {!!contribution && (
                <div>
                  <Button
                    variant="success"
                    className="btn-simple"
                    onClick={createSubmissionHandler(
                      onReleaseSubmit,
                      onReleaseSubmitError
                    )}
                  >
                    Claim sponsor earnings
                  </Button>
                </div>
              )}
            </h2>
          )}
          {!nft.serial.isZero() && (
            <h2 className="main-price">
              <div>
                <span className="mr-2">by</span>
                <Link to={`/${nft.stallName}`} className="text-info">
                  {nft.stallName}
                </Link>
              </div>
              <div className="supply mt-1 ">
                <span className="mr-1">Serial No.</span>
                <span className="serial text-success">
                  {nft.serial.toString()}
                </span>
                <span className="ml-1">
                  of{" "}
                  {nft.maxSupply.isZero()
                    ? "unlimited"
                    : nft.maxSupply.toString()}
                </span>
              </div>
            </h2>
          )}
          <h5 className="category">Description</h5>
          <p className="description">{nft.description}</p>
          <Row className="justify-content-start mt-4">
            {nft.serial.isZero() && (
              <Button
                className="ml-3"
                color="warning"
                onClick={createSubmissionHandler(onSubmit, onSubmitError)}
              >
                <i className="tim-icons icon-cart mr-2" />
                Buy 
              </Button>
            )}
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default NFTView;
