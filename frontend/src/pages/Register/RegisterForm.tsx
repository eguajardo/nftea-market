import { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useContractFunction } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { useFormFields } from "hooks/useFormFields";
import useFormAlert from "hooks/useFormAlert";

import { createSubmissionHandler } from "helpers/submissionHandler";
import { uploadJSONMetadata } from "helpers/ipfs";

import FormGroup from "components/ui/FormGroup/FormGroup";
import { Market } from "types/typechain";
import SubmitButton from "components/ui/SubmitButton";
import { FormProcessingStatus, FormState } from "types/forms";

function RegisterForm() {
  console.log("render RegisterForm");
  const { stallId } = useParams<{ stallId: string }>();
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
          label: "ID for your market stall page",
          value: stallId ? stallId : undefined,
          placeholder: "johnDoe",
          prepend: "https://nftea.market.com/",
          validator: (field): string | null => {
            if (!field.value || field.value.trim() === "") {
              return "Username must not be empty!";
            }
            return null;
          },
        },
      ],
      [
        "name",
        {
          type: "text",
          id: "name",
          label: "Your stall page name",
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
          label: "About your stall",
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

  const routerHistory = useHistory();

  const [formState, setFormState] = useState<FormState>({});
  const { successAlertResult } = useFormAlert(formState);

  const marketContract: Market = useContract("Market")!;

  const { state: registrationState, send: sendRegistration } =
    useContractFunction(marketContract, "registerStall");

  const onSubmit = async () => {
    registrationState.status = "None";
    setFormState({
      status: FormProcessingStatus.Processing,
      statusTitle: "Registering profile...",
    });

    const uri: string = await uploadJSONMetadata({
      name: formFields.get("name")!.value,
      description: formFields.get("about")!.value,
    });

    sendRegistration(formFields.get("username")!.value, uri);
  };

  const onSubmitError = async (err: any) => {
    setFormState({
      status: FormProcessingStatus.Error,
      statusMessage: err.message,
    });
  };

  useEffect(() => {
    if (
      registrationState &&
      formState.status === FormProcessingStatus.Processing
    ) {
      switch (registrationState.status) {
        case "Success":
          console.log("Registration done");
          setFormState({
            status: FormProcessingStatus.Success,
            statusMessage: "Profile Created",
          });
          break;
        case "Exception":
        case "Fail":
          setFormState({
            status: FormProcessingStatus.Error,
            statusMessage: registrationState.errorMessage,
          });
          console.error("Transaction Error:", registrationState.errorMessage);
          break;
      }
    }
  }, [registrationState, formState.status]);

  const waitSuccessAlertDismiss = useCallback(async () => {
    if (
      formState.status === FormProcessingStatus.Success &&
      successAlertResult
    ) {
      routerHistory.push(`/${formFields.get("username")!.value}`);
    }
  }, [formState.status, successAlertResult, routerHistory, formFields]);

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
