import { useDropzone } from "react-dropzone";

import { Fragment } from "react";
import { Form } from "react-bootstrap";
import { FormGroupInterface } from "types/forms";

import "./style.scss";
import React from "react";

const classNames = require("classnames");

function FormControl({
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

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    maxFiles: 1,
    onDropAccepted: (acceptedFiles, event) => {
      console.log("DROPPED", getInputProps());
      onChange!(
        event as React.BaseSyntheticEvent<
          DragEvent,
          HTMLInputElement,
          HTMLInputElement
        >
      );
    },
  });

  let style = {};
  if (field.enteredFiles) {
    style = {
      backgroundImage: `url(${URL.createObjectURL(field.enteredFiles[0])})`,
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
            <Form.Control
              {...getInputProps({
                className: classNames({ "is-invalid": error }),
              })}
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
      )}

      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </Fragment>
  );
}

export default FormControl;
