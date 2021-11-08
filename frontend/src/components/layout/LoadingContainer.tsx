import LoadingAnimation from "components/ui/LoadingAnimation";
import { Fragment } from "react";

function LoadingContainer(props: { condition: any; children: JSX.Element }) {
  return (
    <Fragment>
      {!props.condition && <LoadingAnimation />}
      {!!props.condition && props.children}
    </Fragment>
  );
}

export default LoadingContainer;
