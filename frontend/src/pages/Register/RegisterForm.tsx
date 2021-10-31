import { useCallback, useEffect, useState } from "react";
import { useContractCall } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { useFormFields } from "hooks/useFormFields";

import FormGroup from "components/ui/FormGroup";
import { Market } from "types/typechain";
import SubmitButton from "components/ui/SubmitButton";
import { createSubmissionHandler } from "helpers/submissionHandler";
import useFormAlert from "hooks/useFormAlert";
import { FormProcessingStatus, FormState } from "types/forms";

function RegisterForm() {
  console.log("render RegisterForm");
  const {
    formFields,
    createValueChangeHandler,
    createInputBlurHandler,
    validateForm,
    hasError,
  } = useFormFields(
    new Map([
      [
        "username",
        {
          type: "text",
          id: "username",
          label: "Username for your market stall",
          placeholder: "johnDoe",
          prepend: "https://nftea.market.com/",
          validator: (field): string | null => {
            if (!field.value || field.value.trim() === "") {
              return "Username must not be empty!";
            }
            if (stallNameTaken) {
              return "Username already taken!";
            }
            console.log("stallNameTaken", stallNameTaken);
            return null;
          },
        },
      ],
      [
        "name",
        {
          type: "text",
          id: "name",
          label: "Your Name",
          placeholder: "John Doe",
          validator: (field): string | null => {
            if (!field.value || field.value.trim() === "") {
              return "Name must not be empty!";
            }

            return null;
          },
        },
      ],
      [
        "about",
        {
          type: "textarea",
          id: "about",
          label: "About you",
          placeholder: "Some description about you and the awesome work you do",
          validator: (field) => {
            if (!field.value || field.value.trim() === "") {
              return "About section must not be empty!";
            }
            return null;
          },
        },
      ],
    ])
  );

  const [formState, setFormState] = useState<FormState>({});
  const { successAlertResult } = useFormAlert(formState);

  const marketContract: Market | null = useContract("Market");
  const [stallNameTaken] =
    useContractCall({
      abi: marketContract?.interface!,
      address: marketContract?.address!,
      method: "stallNameTaken",
      args: [formFields.get("username")?.value ?? ""],
    }) ?? [];

  const onSubmit = async () => {
    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Registering profile...",
    });
    console.log("TEST");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setFormState({
      status: FormProcessingStatus.Success,
      statusMessage: "Profile Created",
    });
  };

  const onSubmitError = async (err: any) => {
    setFormState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  const waitSuccessAlertDismiss = useCallback(async () => {
    if (
      formState.status === FormProcessingStatus.Success &&
      successAlertResult
    ) {
      console.log("dismissed");
    }
  }, [formState.status, successAlertResult]);

  useEffect(() => {
    waitSuccessAlertDismiss();
  }, [waitSuccessAlertDismiss]);

  return (
    <form
      onSubmit={createSubmissionHandler(onSubmit, onSubmitError, validateForm)}
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
          formProcessing={formState.status === FormProcessingStatus.Processing}
        >
          Submit
        </SubmitButton>
      </div>
    </form>
  );
}

export default RegisterForm;
