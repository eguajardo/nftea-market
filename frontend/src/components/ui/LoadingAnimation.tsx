function LoadingAnimation() {
  return (
    <span>
      <span
        className="spinner-grow spinner-grow-sm ml-2 mb-1"
        role="status"
        aria-hidden="true"
        style={{ display: "inline-block" }}
      ></span>
      <span
        className="spinner-grow spinner-grow-sm ml-2 mb-1"
        role="status"
        aria-hidden="true"
        style={{ display: "inline-block" }}
      ></span>
      <span
        className="spinner-grow spinner-grow-sm ml-2 mb-1"
        role="status"
        aria-hidden="true"
        style={{ display: "inline-block" }}
      ></span>
    </span>
  );
}

export default LoadingAnimation;
