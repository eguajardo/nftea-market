import { uploadJSONMetadata, uploadFile } from "helpers/ipfs";
import { createSubmissionHandler } from "helpers/submissionHandler";

import { useCallback, useEffect, useState } from "react";
import { useContractFunction } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { useFormFields } from "hooks/useFormFields";
import useFormAlert from "hooks/useFormAlert";

import { FormProcessingStatus, FormState } from "types/forms";
import { Market } from "types/typechain";
import { Content } from "pages/Profile/Profile";
import { SponsorshipData } from "types/metadata";

import FormGroup from "components/ui/FormGroup/FormGroup";
import SubmitButton from "components/ui/SubmitButton";
import { Col, Row } from "react-bootstrap";

type Properties = SponsorshipData & {
  setContentDisplaying: React.Dispatch<React.SetStateAction<Content>>;
  setIsFinalizing: React.Dispatch<React.SetStateAction<boolean>>;
};

function SponsorshipFinalizingForm({
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
    resetForm,
  } = useFormFields(
    new Map([
      [
        "title",
        {
          type: "text",
          id: "title",
          label: "Title",
          placeholder: "Cybertea",
          validator: (field): string | null => {
            if (!field.value || field.value.trim() === "") {
              return "Title must not be empty!";
            }

            return null;
          },
        },
      ],
      [
        "description",
        {
          type: "textarea",
          id: "description",
          label: "Description",
          placeholder:
            "This cup of tea lives in the year 2077 where blockchain technology has taken over the world",
          validator: (field) => {
            if (!field.value || field.value.trim() === "") {
              return "Description must not be empty!";
            }
            return null;
          },
        },
      ],
      [
        "image",
        {
          type: "file",
          id: "image",
          label: "Image",
          placeholder: "Drag & drop or click to select file",
          validator: (field) => {
            if (!field.value || field.value.trim() === "") {
              return "Image is missing!";
            }

            return null;
          },
        },
      ],
    ])
  );

  const [formState, setFormState] = useState<FormState>({});
  const { successAlertResult } = useFormAlert(formState);
  const marketContract: Market = useContract("Market")!;

  const { state: postNFTState, send: postNFTForSale } = useContractFunction(
    marketContract,
    "postSponsoredNFTForSale"
  );

  const onSubmit = async () => {
    postNFTState.status = "None";
    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Creating sponsored NFT...",
    });

    const imageUri = await uploadFile(
      formFields.get("image")!.enteredFiles![0]
    );

    const uri: string = await uploadJSONMetadata({
      name: formFields.get("title")!.value,
      description: formFields.get("description")!.value,
      image: imageUri,
    });

    postNFTForSale(sponsorship.sponsorshipId, uri);
  };

  const onSubmitError = async (err: any) => {
    setFormState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  useEffect(() => {
    if (postNFTState && formState.status === FormProcessingStatus.Processing) {
      switch (postNFTState.status) {
        case "Success":
          console.log("Sponsored NFT created");
          setFormState({
            status: FormProcessingStatus.Success,
            statusMessage: "Sponsored NFT created!",
          });
          break;
        case "Exception":
        case "Fail":
          setFormState({
            status: FormProcessingStatus.Error,
            statusMessage: postNFTState.errorMessage,
          });
          console.error("Transaction Error:", postNFTState.errorMessage);
          break;
      }
    }
  }, [postNFTState, formState.status]);

  const waitSuccessAlertDismiss = useCallback(async () => {
    if (
      formState.status === FormProcessingStatus.Success &&
      successAlertResult
    ) {
      resetForm();
      setContentDisplaying(Content.NFTs);
    }
  }, [formState.status, successAlertResult, resetForm, setContentDisplaying]);

  useEffect(() => {
    waitSuccessAlertDismiss();
  }, [waitSuccessAlertDismiss]);

  return (
    <div>
      <form
        onSubmit={createSubmissionHandler(
          onSubmit,
          onSubmitError,
          validateForm
        )}
      >
        <Row>
          <Col md={9} xs={12}>
            <FormGroup
              key={formFields.get("title")!.id}
              field={formFields.get("title")!}
              onChange={createValueChangeHandler(formFields.get("title")!)}
              onBlur={createInputBlurHandler(formFields.get("title")!)}
              error={hasError(formFields.get("title")!)}
            />
            <FormGroup
              key={formFields.get("description")!.id}
              field={formFields.get("description")!}
              onChange={createValueChangeHandler(
                formFields.get("description")!
              )}
              onBlur={createInputBlurHandler(formFields.get("description")!)}
              error={hasError(formFields.get("description")!)}
            />
            <div id="actions" className="mt-4">
              <SubmitButton
                formProcessing={
                  formState.status === FormProcessingStatus.Processing
                }
              >
                Fulfill
              </SubmitButton>
            </div>
          </Col>
          <Col md={3} xs={12}>
            <FormGroup
              key={formFields.get("image")!.id}
              field={formFields.get("image")!}
              onChange={createValueChangeHandler(formFields.get("image")!)}
              onBlur={createInputBlurHandler(formFields.get("image")!)}
              error={hasError(formFields.get("image")!)}
            />
          </Col>
        </Row>
      </form>
    </div>
  );
}

export default SponsorshipFinalizingForm;
