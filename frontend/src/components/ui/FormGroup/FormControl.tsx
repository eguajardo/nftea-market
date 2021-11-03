import { useDropzone } from "react-dropzone";

import { Fragment, useState } from "react";
import { Form } from "react-bootstrap";
import { FormGroupInterface } from "types/forms";
import Input from "./Input";

import "dropzone/dist/dropzone.css";
import "./style.scss";

const classNames = require("classnames");

function FormControl({
  field,
  onChange,
  onBlur,
  className,
  disabled,
  error,
}: FormGroupInterface) {
  const [file, setFile] = useState<File>();
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  let style = {};
  if (file) {
    style = {
      backgroundImage: `url(${URL.createObjectURL(file!)})`,
    };
  }

  return (
    <Fragment>
      {field.type === "file" && (
        <div>
          <div
            {...getRootProps({
              className: classNames("dropzone", { "is-invalid": error }),
              style: style,
            })}
          >
            <Input
              field={field}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
              className={className}
              disabled={disabled}
              fileInputProperties={getInputProps()}
            />
            {!field.value && (
              <div className="dropzone-message">{field.placeholder}</div>
            )}
            {error && (
              <Form.Control.Feedback type="invalid">
                {error}
              </Form.Control.Feedback>
            )}
          </div>
        </div>
      )}
      {field.type !== "file" && (
        <Input
          field={field}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          className={className}
          disabled={disabled}
        />
      )}

      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </Fragment>
  );
}

export default FormControl;
