import { uploadJSONMetadata } from "helpers/ipfs";
import { createSubmissionHandler } from "helpers/submissionHandler";

import { useEffect, useState } from "react";
import { useContractFunction } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { useFormFields } from "hooks/useFormFields";
import useFormAlert from "hooks/useFormAlert";

import { FormProcessingStatus, FormState } from "types/forms";
import { Market } from "types/typechain";

import FormGroup from "components/ui/FormGroup";
import SubmitButton from "components/ui/SubmitButton";

function NewNFT() {
  const {
    formFields,
    createValueChangeHandler,
    createInputBlurHandler,
    validateForm,
    hasError,
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
    ])
  );

  const [formState, setFormState] = useState<FormState>({});
  const { successAlertResult } = useFormAlert(formState);
  const marketContract: Market = useContract("Market")!;

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

    const uri: string = await uploadJSONMetadata({
      name: formFields.get("title")!.value,
      description: formFields.get("description")!.value,
    });

    postNFTForSale(formFields.get("title")!.value, uri);
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

  return (
    <div>
      <form
        onSubmit={createSubmissionHandler(
          onSubmit,
          onSubmitError,
          validateForm
        )}
      >
        {Array.from(formFields.values()).map((formField) => {
          return (
            <FormGroup
              key={formField.id}
              field={formField}
              onChange={createValueChangeHandler(formField)}
              onBlur={createInputBlurHandler(formField)}
              error={hasError(formField)}
            />
          );
        })}

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
