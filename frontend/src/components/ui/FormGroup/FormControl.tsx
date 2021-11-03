import { useDropzone, DropzoneInputProps } from "react-dropzone";

import { Fragment, useState } from "react";
import { Form } from "react-bootstrap";
import { FormGroupInterface } from "types/forms";
import Input from "./Input";

import "dropzone/dist/dropzone.css";
import "./style.scss";

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

  let inputProps: DropzoneInputProps;
  if (field.type === "file") {
    inputProps = getInputProps({
      className: "dropzone-input",
    });
  }

  return (
    <Fragment>
      {field.type === "file" && (
        <div>
          <div
            {...getRootProps({
              className: "dropzone",
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
              fileInputProperties={inputProps!}
            />
            <p>Drag 'n' drop some files here, or click to select files</p>
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
