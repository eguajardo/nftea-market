import { useCallback, useState } from "react";

type ValidatorFunction = (
  field: FormField,
  allFields?: Map<string, FormField>
) => string | null;

type InputType = "text" | "number" | "file" | "textarea";

/**
 *    {
 *      type: "text",
 *      id: "name",
 *      label: "Input label",
 *      placeholder: "Input placeholder",
 *      value: "Some value",
 *      isTouched: true, // set automatically
 *      enteredFiles: [], // set automatically only when input type = file
 *      validator: (field, allFields) => { return "Error message" } // validates and return error
 *    }
 */
interface FormField {
  type: InputType;
  id: string;
  label?: string;
  placeholder?: string;
  value?: any;
  isTouched?: boolean;
  enteredFiles?: FileList | null | undefined;
  validator?: ValidatorFunction;
}

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
    (field: FormField) => (event?: React.ChangeEvent<HTMLInputElement>) => {
      if (event?.target?.type === "file") {
        field.enteredFiles = event.target.files;
        // file input is not marked touched when opening file explorer dialog,
        // instead we mark it in here
        field.isTouched = true;
      }
      field.value = event?.target?.value;
      setFormFields((prevState) => mergeAttributes(prevState, field));
    };

  const createInputBlurHandler =
    (field: FormField) => (event?: React.FocusEvent<HTMLInputElement>) => {
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
