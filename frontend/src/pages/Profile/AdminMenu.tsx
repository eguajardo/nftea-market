import { uploadFile, uploadJSONMetadata } from "helpers/ipfs";
import { createSubmissionHandler } from "helpers/submissionHandler";
import { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import useFormAlert from "hooks/useFormAlert";
import { Market } from "types/typechain";
import { FormProcessingStatus, FormState } from "types/forms";
import { Metadata } from "types/metadata";
import { ImageSource } from "./Profile";

import { Button, Container } from "react-bootstrap";

type Properties = {
  vendorAddress: string;
  metadata?: Metadata;
  profilePic?: ImageSource;
  headerPic?: ImageSource;
  editing: boolean;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
};

function AdminMenu({
  vendorAddress,
  metadata,
  profilePic,
  headerPic,
  editing,
  editMode,
  setEditMode,
}: Properties) {
  const { stallId } = useParams<{ stallId: string }>();
  const { account } = useEthers();
  const marketContract: Market = useContract<Market>("Market")!;
  const [formState, setFormState] = useState<FormState>({});
  const { Alert } = useFormAlert(formState);
  const { state: updateUriState, send: sendUriUpdate } = useContractFunction(
    marketContract,
    "updateURI"
  );

  const onSubmit = async () => {
    updateUriState.status = "None";

    if (!metadata) {
      Alert.fire({
        icon: "warning",
        title: "Profile hasn't been fully loaded yet",
      });
      return;
    }

    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Updating profile...",
    });

    const newMetadata: Metadata = { ...metadata };

    if (profilePic?.file) {
      newMetadata.image = await uploadFile(profilePic.file);
    }
    if (headerPic?.file) {
      newMetadata.headerImage = await uploadFile(headerPic.file);
    }

    const uri: string = await uploadJSONMetadata(newMetadata);
    await sendUriUpdate(uri);
  };

  const onSubmitError = async (err: any) => {
    setFormState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  useEffect(() => {
    if (
      updateUriState &&
      formState.status === FormProcessingStatus.Processing
    ) {
      switch (updateUriState.status) {
        case "Success":
          console.log("Profile updated!");
          setFormState({
            status: FormProcessingStatus.Success,
            statusMessage: "Profile updated!",
          });
          break;
        case "Exception":
        case "Fail":
          setFormState({
            status: FormProcessingStatus.Error,
            statusMessage: updateUriState.errorMessage,
          });
          console.error("Transaction Error:", updateUriState.errorMessage);
          break;
      }
    }
  }, [updateUriState, formState.status, setEditMode]);

  const cancelEditMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setEditMode(false);
  };

  return (
    <Fragment>
      {vendorAddress && vendorAddress === account && (
        <Container
          className="admin-menu text-right mb-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Link to={`/${stallId}/nfts/new`}>
            <Button variant="warning" size="sm">
              Create NFT
            </Button>
          </Link>
          <Link to={`/${stallId}/sponsorships/new`}>
            <Button variant="warning" size="sm">
              Request sponsorship
            </Button>
          </Link>
          {!editMode && (
            <Button
              variant="default"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                setEditMode(true);
              }}
            >
              <i className="tim-icons icon-pencil" />
            </Button>
          )}
          {editing && (
            <Button
              variant="default"
              size="sm"
              onClick={createSubmissionHandler(onSubmit, onSubmitError)}
            >
              Save image changes
            </Button>
          )}
          {((editMode && (metadata?.image || metadata?.headerImage)) ||
            editing) && (
            <Button variant="default" size="sm" onClick={cancelEditMode}>
              <i className="tim-icons icon-simple-remove" />
            </Button>
          )}
        </Container>
      )}
    </Fragment>
  );
}

export default AdminMenu;
