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

function FormGroup({
  field,
  onChange,
  onBlur,
  className,
  disabled,
  error,
}: FormGroupInterface) {
  var classNames = require("classnames");

  let as: React.ElementType<any> | undefined;
  let type: string | undefined = field.type;

  if (field.type === "textarea") {
    as = "textarea";
    type = undefined;
  }
  return (
    <div>
      <Form.Group className="form-group">
        {field.label && <Form.Label>{field.label}</Form.Label>}
        <InputGroup>
          <div className="input-group-prepend">
            <InputGroup.Text
              className={classNames("input-group-block", {
                "is-invalid": error,
              })}
            >
              https://nftea.market.com/
            </InputGroup.Text>
          </div>
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
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          )}
        </InputGroup>
      </Form.Group>
    </div>
  );
}

export default FormGroup;
