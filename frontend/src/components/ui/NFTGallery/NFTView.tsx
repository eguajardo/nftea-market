import { useEffect, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import useFormAlert from "hooks/useFormAlert";
import { createSubmissionHandler } from "helpers/submissionHandler";
import { Button, Col, Row, Image } from "react-bootstrap";
import { NFTData } from "types/metadata";
import { Market } from "types/typechain";
import { FormProcessingStatus, FormState } from "types/forms";
import useAuthorizationSignature from "hooks/useAuthorizationSignature";

function NFTView(nft: NFTData) {
  const [formState, setFormState] = useState<FormState>({});
  const { Alert } = useFormAlert(formState);

  const marketContract: Market = useContract<Market>("Market")!;
  const { account, library } = useEthers();

  const { state: buyNFTState, send: sendBuyNFT } = useContractFunction(
    marketContract,
    "buyNFT"
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

    buyNFTState.status = "None";
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

    console.log("library", library, library.getSigner());
    const { v, r, s, nonce, validBefore } = await signAuthorization(library, {
      from: account,
      to: await marketContract.paymentAddress(nft.nftClass),
      value: nft.price,
    });

    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Purchasing NFT...",
    });

    console.log("signature", v, r, s, nonce, validBefore);
    sendBuyNFT(nft.nftClass, nonce, validBefore, v, r, s);
  };

  const onSubmitError = async (err: any) => {
    setFormState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  useEffect(() => {
    if (buyNFTState && formState.status === FormProcessingStatus.Processing) {
      switch (buyNFTState.status) {
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
            statusMessage: buyNFTState.errorMessage,
          });
          console.error("Transaction Error:", buyNFTState.errorMessage);
          break;
      }
    }
  }, [buyNFTState, formState.status]);

  return (
    <div>
      <Row>
        <Col lg="6" md="12">
          <Image src={nft.image} className="align-middle" />
        </Col>
        <Col className="mx-auto" lg="6" md="12">
          <h2 className="title">{nft.name}</h2>
          <h2 className="main-price">
            <div>${(nft.price.toNumber() / 100).toFixed(2)} USD</div>
            <span className="mt-1 supply">
              Supply:{" "}
              {nft.supply.isZero() ? "unlimited" : nft.supply.toString()}
            </span>
          </h2>
          <h5 className="category">Description</h5>
          <p className="description">{nft.description}</p>
          <Row className="justify-content-start mt-4">
            <Button
              className="ml-3"
              color="warning"
              onClick={createSubmissionHandler(onSubmit, onSubmitError)}
            >
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
