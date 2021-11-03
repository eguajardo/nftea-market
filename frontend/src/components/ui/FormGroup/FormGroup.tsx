import { Form, InputGroup } from "react-bootstrap";
import { FormGroupInterface } from "types/forms";
import FormControl from "./FormControl";

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

            <FormControl
              field={field}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
              className={className}
              disabled={disabled}
            />
          </InputGroup>
        )}
        {!field.prepend && (
          <FormControl
            field={field}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            className={className}
            disabled={disabled}
          />
        )}
      </Form.Group>
    </div>
  );
}

export default FormGroup;
