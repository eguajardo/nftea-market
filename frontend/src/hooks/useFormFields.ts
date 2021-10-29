import { useCallback, useState } from "react";
import { FormField } from "types/forms";

function mergeAttributes(
  prevState: Map<string, FormField>,
  changedField: FormField
): Map<string, FormField> {
  prevState.set(changedField.id, changedField);

  return new Map(prevState);
}

/**
 * Hook to manage the form input fields states
 */
export function useFormFields(initialFields: Map<string, FormField>) {
  const [formFields, setFormFields] = useState(initialFields);

  const hasError = (field: FormField) => {
    if (field.isTouched && field.validator) {
      return field.validator(field, formFields);
    }

    return null;
  };

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    formFields.forEach((field) => {
      if (field.validator && field.validator(field, formFields)) {
        isValid = false;
      }

      createInputBlurHandler(field)();
    });

    return isValid;
  }, [formFields]);

  const resetForm = useCallback(() => {
    setFormFields((prevState) => {
      prevState.forEach((field) => {
        field.isTouched = false;
        field.value = "";
      });

      return new Map(prevState);
    });
  }, []);

  const createValueChangeHandler =
    (field: FormField) =>
    (event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event?.currentTarget?.type === "file") {
        const target = event.currentTarget as HTMLInputElement;
        field.enteredFiles = target.files;
        // file input is not marked touched when opening file explorer dialog,
        // instead we mark it in here
        field.isTouched = true;
      }
      field.value = event?.currentTarget?.value;
      setFormFields((prevState) => mergeAttributes(prevState, field));
    };

  const createInputBlurHandler =
    (field: FormField) =>
    (event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event?.target?.type === "file") {
        // file input should not be marked as touched when opening the file explorer
        return;
      }

      field.isTouched = true;
      setFormFields((prevState) => mergeAttributes(prevState, field));
    };

  return {
    formFields,
    createValueChangeHandler,
    createInputBlurHandler,
    validateForm,
    hasError,
    resetForm,
  };
}
