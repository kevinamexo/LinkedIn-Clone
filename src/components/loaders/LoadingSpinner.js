import React from "react";
import { css } from "@emotion/react";
import "./LoadingSpinner.css";
import BeatLoader from "react-spinners/BeatLoader";

const override = css`
  display: block;
  margin: 150px auto;
  border-color: #0a66c2;
`;

const LoadingSpinner = ({ loading }) => {
  return (
    <div className="loadingSpinner">
      <BeatLoader
        loading={loading}
        height={4}
        width={150}
        color={"#0a66c2"}
        loading={loading}
        css={override}
      />
    </div>
  );
};

export default LoadingSpinner;
