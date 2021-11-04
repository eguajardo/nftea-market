import { FileWithPath } from "file-selector";

export type ValidatorFunction = (
  field: FormField,
  allFields?: Map<string, FormField>
) => string | null;

export type InputType = "text" | "number" | "file" | "textarea";

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
export interface FormField {
  type: InputType;
  id: string;
  label?: string;
  placeholder?: string;
  step?: number;
  value?: any;
  isTouched?: boolean;
  enteredFiles?: (FileWithPath | File)[] | null | undefined;
  validator?: ValidatorFunction;
  prepend?: any;
  append?: any;
}

export enum FormProcessingStatus {
  Processing,
  Success,
  Error,
}

export interface FormState {
  status?: FormProcessingStatus | null;
  statusTitle?: string | null;
  statusMessage?: string | JSX.Element | null;
}

export interface FormGroupInterface {
  field: FormField;
  onChange?: (
    event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  className?: string;
  disabled?: boolean;
  error: string | null;
}
