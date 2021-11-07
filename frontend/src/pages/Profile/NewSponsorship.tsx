import { uploadJSONMetadata, uploadFile } from "helpers/ipfs";
import { createSubmissionHandler } from "helpers/submissionHandler";

import { useCallback, useEffect, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { useFormFields } from "hooks/useFormFields";
import useFormAlert from "hooks/useFormAlert";

import { FormProcessingStatus, FormState } from "types/forms";
import { Metadata } from "types/metadata";
import { Market } from "types/typechain";

import FormGroup from "components/ui/FormGroup/FormGroup";
import SubmitButton from "components/ui/SubmitButton";
import { Col, Row } from "react-bootstrap";
import { Content } from "./Profile";

function NewSponsorship(props: {
  setContentDisplaying: React.Dispatch<React.SetStateAction<Content>>;
}) {
  console.log("render NewSponsorship");
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
          label: "Sponsorship Ad title",
          placeholder: "Need support with an awesome project!",
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
          label: "Sponsorship description",
          placeholder:
            "Help me get this project started by sponsoring me and receive a % from this NFT sales proportional to your contribution...",
          validator: (field) => {
            if (!field.value || field.value.trim() === "") {
              return "Description must not be empty!";
            }
            return null;
          },
        },
      ],
      [
        "percent",
        {
          type: "number",
          id: "percent",
          label: "% of sales reserved for sponsors",
          step: 0.01,
          placeholder: parseFloat("7.25").toFixed(2),
          prepend: "%",
          validator: (field) => {
            if (!field.value || field.value <= 0) {
              return "Percent must be greater than zero!";
            }

            return null;
          },
        },
      ],
      [
        "amount",
        {
          type: "number",
          id: "amount",
          label: "Requested amount",
          step: 0.01,
          placeholder: parseFloat("2000").toFixed(2),
          prepend: "$",
          append: "USD",
          validator: (field) => {
            if (!field.value || field.value < 0) {
              return "Amount must be greater or equal than zero!";
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
          label: "NFT copies",
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
          label: "NFT price",
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
          label: "Sponsorship Ad image (optional)",
          placeholder: "Drag & drop or click to select file",
          validator: (field) => {
            return null;
          },
        },
      ],
    ])
  );

  const [formState, setFormState] = useState<FormState>({});
  const { successAlertResult } = useFormAlert(formState);
  const marketContract: Market = useContract("Market")!;
  const { library } = useEthers();

  const { state: requestSponsorshipState, send: sendRequestSponsorship } =
    useContractFunction(marketContract, "requestSponsorship");

  const onSubmit = async () => {
    requestSponsorshipState.status = "None";
    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Creating sponsorship...",
    });

    const metadata: Metadata = {
      name: formFields.get("title")!.value,
      description: formFields.get("description")!.value,
    };

    if (
      formFields.get("image")?.enteredFiles &&
      formFields.get("image")!.enteredFiles!.length > 0
    ) {
      metadata.image = await uploadFile(
        formFields.get("image")!.enteredFiles![0]
      );
    }

    const uri: string = await uploadJSONMetadata(metadata);

    const blockNumber: number = await library!.getBlockNumber();
    let timestamp: number = (await library!.getBlock(blockNumber)).timestamp;
    timestamp = timestamp + 86400 * 30; // 30 days from block

    sendRequestSponsorship(
      formFields.get("supply")!.value,
      // Convert to cents and remove decimals created by precision errors
      (formFields.get("price")!.value * 100).toFixed(0),
      (formFields.get("percent")!.value * 100).toFixed(0),
      uri,
      (formFields.get("amount")!.value * 100).toFixed(0),
      timestamp
    );
  };

  const onSubmitError = async (err: any) => {
    setFormState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  useEffect(() => {
    if (
      requestSponsorshipState &&
      formState.status === FormProcessingStatus.Processing
    ) {
      switch (requestSponsorshipState.status) {
        case "Success":
          console.log("Sponsorship created");
          setFormState({
            status: FormProcessingStatus.Success,
            statusMessage: "Sponsorship created!",
          });
          break;
        case "Exception":
        case "Fail":
          setFormState({
            status: FormProcessingStatus.Error,
            statusMessage: requestSponsorshipState.errorMessage,
          });
          console.error(
            "Transaction Error:",
            requestSponsorshipState.errorMessage
          );
          break;
      }
    }
  }, [requestSponsorshipState, formState.status]);

  const waitSuccessAlertDismiss = useCallback(async () => {
    if (
      formState.status === FormProcessingStatus.Success &&
      successAlertResult
    ) {
      resetForm();
      props.setContentDisplaying(Content.Sponsorships);
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
                  key={formFields.get("percent")!.id}
                  field={formFields.get("percent")!}
                  onChange={createValueChangeHandler(
                    formFields.get("percent")!
                  )}
                  onBlur={createInputBlurHandler(formFields.get("percent")!)}
                  error={hasError(formFields.get("percent")!)}
                />
              </Col>
              <Col>
                <FormGroup
                  key={formFields.get("amount")!.id}
                  field={formFields.get("amount")!}
                  onChange={createValueChangeHandler(formFields.get("amount")!)}
                  onBlur={createInputBlurHandler(formFields.get("amount")!)}
                  error={hasError(formFields.get("amount")!)}
                />
              </Col>
            </Row>
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

export default NewSponsorship;
