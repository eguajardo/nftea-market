import {
  ReactElement,
  JSXElementConstructor,
  ReactNodeArray,
  ReactPortal,
} from "react";
import { Button } from "react-bootstrap";
import LoadingAnimation from "./LoadingAnimation";

function SubmitButton(props: {
  formProcessing: boolean | undefined;
  children:
    | string
    | number
    | boolean
    | {}
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactNodeArray
    | ReactPortal
    | null
    | undefined;
}) {
  return (
    <Button type="submit" variant="primary" disabled={props.formProcessing}>
      {!props.formProcessing && props.children}
      {props.formProcessing && <LoadingAnimation />}
    </Button>
  );
}

export default SubmitButton;
