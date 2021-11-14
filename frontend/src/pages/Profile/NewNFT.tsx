import { uploadJSONMetadata, uploadFile } from "helpers/ipfs";
import { createSubmissionHandler } from "helpers/submissionHandler";

import { useCallback, useEffect, useState } from "react";
import { useContractFunction } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { useFormFields } from "hooks/useFormFields";
import useFormAlert from "hooks/useFormAlert";

import { FormProcessingStatus, FormState } from "types/forms";
import { Market } from "types/typechain";
import { Content } from "./Profile";

import FormGroup from "components/ui/FormGroup/FormGroup";
import SubmitButton from "components/ui/SubmitButton";
import { Col, Row } from "react-bootstrap";

function NewNFT(props: {
  setContentDisplaying: React.Dispatch<React.SetStateAction<Content>>;
}) {
  console.log("render NewNFT");
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
        "supply",
        {
          type: "number",
          id: "supply",
          label: "Copies",
          step: 1,
          value: 0,
          placeholder: "Leave zero for unlimited",
          validator: (field) => {
            if (field.value < 0) {
              return "Copies must not be negative!";
            }
            if (!Number.isInteger(parseInt(field.value))) {
              return "Copies must be integer value!";
            }

            return null;
          },
        },
      ],
      [
        "price",
        {
          type: "number",
          id: "price",
          label: "Price",
          step: 0.01,
          placeholder: parseFloat("10").toFixed(2),
          prepend: "$",
          append: "USD",
          validator: (field) => {
            if (!field.value || field.value <= 0) {
              return "Price must not be zero!";
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
  const marketContract: Market = useContract<Market>("Market")!;

  const { state: postNFTState, send: postNFTForSale } = useContractFunction(
    marketContract,
    "postNFTForSale"
  );

  const onSubmit = async () => {
    postNFTState.status = "None";
    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Creating NFT...",
    });

    const imageUri = await uploadFile(
      formFields.get("image")!.enteredFiles![0]
    );

    const uri: string = await uploadJSONMetadata({
      name: formFields.get("title")!.value,
      description: formFields.get("description")!.value,
      image: imageUri,
    });

    postNFTForSale(
      uri,
      formFields.get("supply")!.value,
      // Convert to cents and remove decimals created by precision errors
      (formFields.get("price")!.value * 100).toFixed(0)
    );
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
          console.log("NFT created");
          setFormState({
            status: FormProcessingStatus.Success,
            statusMessage: "NFT created!",
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
      props.setContentDisplaying(Content.NFTs);
    }
  }, [formState.status, successAlertResult, resetForm, props]);

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
            <Row>
              <Col>
                <FormGroup
                  key={formFields.get("supply")!.id}
                  field={formFields.get("supply")!}
                  onChange={createValueChangeHandler(formFields.get("supply")!)}
                  onBlur={createInputBlurHandler(formFields.get("supply")!)}
                  error={hasError(formFields.get("supply")!)}
                />
              </Col>
              <Col>
                <FormGroup
                  key={formFields.get("price")!.id}
                  field={formFields.get("price")!}
                  onChange={createValueChangeHandler(formFields.get("price")!)}
                  onBlur={createInputBlurHandler(formFields.get("price")!)}
                  error={hasError(formFields.get("price")!)}
                />
              </Col>
            </Row>
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

        <div id="actions" className="mt-4">
          <SubmitButton
            formProcessing={
              formState.status === FormProcessingStatus.Processing
            }
          >
            Create
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

export default NewNFT;
