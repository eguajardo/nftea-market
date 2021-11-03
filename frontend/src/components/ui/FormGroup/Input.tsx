import { Form } from "react-bootstrap";
import { FormGroupInterface } from "types/forms";

const classNames = require("classnames");

function Input({
  field,
  onChange,
  onBlur,
  className,
  disabled,
  error,
  fileInputProperties,
}: FormGroupInterface) {
  let as: React.ElementType<any> | undefined;
  let type: string | undefined = field.type;

  if (field.type === "textarea") {
    as = "textarea";
    type = undefined;
  }

  if (fileInputProperties) {
    // workaround for weird error complaining about setting value to element
    delete fileInputProperties.style;

    const oldOnChange = onChange;
    onChange = (
      event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (oldOnChange) {
        oldOnChange(event);
      }
      if (fileInputProperties.onChange) {
        fileInputProperties.onChange(
          event as React.ChangeEvent<HTMLInputElement>
        );
      }
    };

    const oldOnBlur = onBlur;
    onBlur = (
      event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (fileInputProperties.onBlur) {
        fileInputProperties.onBlur(event as React.FocusEvent<HTMLInputElement>);
      }
      if (oldOnBlur) {
        oldOnBlur(event!);
      }
    };

    className = classNames(className, fileInputProperties.className);
  }

  return (
    <Form.Control
      {...fileInputProperties}
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
  );
}

export default Input;
