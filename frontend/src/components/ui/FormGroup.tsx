import { Fragment } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { FormField } from "types/forms";

interface FormGroupInterface {
  field: FormField;
  onChange?: (
    event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  className?: string;
  disabled?: boolean;
  error: string | null;
}

const classNames = require("classnames");

function FormGroup({
  field,
  onChange,
  onBlur,
  className,
  disabled,
  error,
}: FormGroupInterface) {
  return (
    <div>
      <Form.Group className="form-group mb-3">
        {field.label && <Form.Label>{field.label}</Form.Label>}
        {field.prepend && (
          <InputGroup>
            {field.prepend && (
              <div className="input-group-prepend">
                <InputGroup.Text
                  className={classNames("input-group-block", {
                    "is-invalid": error,
                  })}
                >
                  {field.prepend}
                </InputGroup.Text>
              </div>
            )}

            <InputField
              field={field}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
            />
          </InputGroup>
        )}
        {!field.prepend && (
          <InputField
            field={field}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
          />
        )}
      </Form.Group>
    </div>
  );
}

function InputField({
  field,
  onChange,
  onBlur,
  className,
  disabled,
  error,
}: FormGroupInterface) {
  let as: React.ElementType<any> | undefined;
  let type: string | undefined = field.type;

  if (field.type === "textarea") {
    as = "textarea";
    type = undefined;
  }

  return (
    <Fragment>
      <Form.Control
        as={as}
        type={type}
        name={field.id}
        id={field.id}
        value={field.value ? field.value : ""}
        placeholder={field.placeholder}
        step={field.step}
        className={classNames(className, { "is-invalid": error })}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
      />

      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </Fragment>
  );
}

export default FormGroup;
