import React from "react";

function RegisterBackground() {
  const [squares1to6, setSquares1to6] = React.useState("");
  const [squares7and8, setSquares7and8] = React.useState("");
  const wrapper = React.useRef(null);

  const followCursor = (event: React.MouseEvent<HTMLDivElement>) => {
    let posX = event.clientX - window.innerWidth / 2;
    let posY = event.clientY - window.innerWidth / 6;
    setSquares1to6(
      "perspective(500px) rotateY(" +
        posX * 0.05 +
        "deg) rotateX(" +
        posY * -0.05 +
        "deg)"
    );
    setSquares7and8(
      "perspective(500px) rotateY(" +
        posX * 0.02 +
        "deg) rotateX(" +
        posY * -0.02 +
        "deg)"
    );
  };

  return (
    <div
      className="wrapper register-page"
      ref={wrapper}
      onMouseMove={followCursor}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        overflowX: "hidden",
      }}
    >
      <div
        className="square square-7"
        id="square7"
        style={{ transform: squares7and8 }}
      />
      <div
        className="square square-8"
        id="square8"
        style={{ transform: squares7and8 }}
      />
      <div
        className="square square-1"
        id="square1"
        style={{ transform: squares1to6 }}
      />
      <div
        className="square square-2"
        id="square2"
        style={{ transform: squares1to6 }}
      />
      <div
        className="square square-3"
        id="square3"
        style={{ transform: squares1to6 }}
      />
      <div
        className="square square-4"
        id="square4"
        style={{ transform: squares1to6 }}
      />
      <div
        className="square square-5"
        id="square5"
        style={{ transform: squares1to6 }}
      />
      <div
        className="square square-6"
        id="square6"
        style={{ transform: squares1to6 }}
      />
    </div>
  );
}

export default RegisterBackground;
