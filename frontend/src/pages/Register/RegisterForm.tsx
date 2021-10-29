import FormGroup from "components/ui/FormGroup";
import { useFormFields } from "hooks/useFormFields";
import React from "react";
import { Button } from "react-bootstrap";

function RegisterForm() {
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

  const formSubmissionHandler = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      console.log("Validation error");
      return;
    }
  };

  return (
    <form onSubmit={formSubmissionHandler}>
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
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </div>
    </form>
  );
}

export default RegisterForm;
