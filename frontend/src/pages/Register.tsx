import FormGroup from "components/ui/FormGroup";
import { useFormFields } from "hooks/useFormFields";
import React from "react";
import { Button, Container } from "react-bootstrap";

function Register() {
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
          placeholder: "title",
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
          placeholder: "Some description",
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

  const formSubmissionHandler = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }
  };

  return (
    <Container>
      <form onSubmit={formSubmissionHandler}>
        {Array.from(formFields.values()).map((formField) => {
          return (
            <FormGroup
              key={formField.id}
              formField={formField}
              hasError={hasError(formField)}
              valueChangeHandler={createValueChangeHandler(formField)}
              inputBlurHandler={createInputBlurHandler(formField)}
            />
          );
        })}

        <div id="actions" className="mt-4">
          <Button variant="primary">Submit</Button>
        </div>
      </form>
    </Container>
  );
}

export default Register;
