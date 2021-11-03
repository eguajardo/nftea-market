import React, { useCallback, useState } from "react";
import { FileWithPath, fromEvent } from "file-selector";
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

  function isFileWithPath(file: any): file is FileWithPath {
    return !!file.path;
  }

  const createValueChangeHandler = (field: FormField) => (event?: any) => {
    if (
      event?.target?.type === "file" ||
      event?.target?.className.includes("dropzone")
    ) {
      Promise.resolve(fromEvent(event)).then((files) => {
        // file input is not marked touched when opening file explorer dialog,
        // instead we mark it in here
        field.isTouched = true;

        field.enteredFiles = files.map(
          (file: FileWithPath | DataTransferItem) => {
            if (isFileWithPath(file)) {
              return file;
            } else {
              return file.getAsFile()!;
            }
          }
        );
        if (isFileWithPath(files[0])) {
          field.value = files[0].path;
        } else {
          field.value = files[0].getAsFile()?.name;
        }
        setFormFields((prevState) => mergeAttributes(prevState, field));
      });
    } else {
      field.value = event?.target?.value;
      setFormFields((prevState) => mergeAttributes(prevState, field));
    }
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
