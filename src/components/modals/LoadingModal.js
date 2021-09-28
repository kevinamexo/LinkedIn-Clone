import React, { useState } from "react";
import "./LoadingModal.css";
import { GrLinkedin } from "react-icons/gr";
import { css } from "@emotion/react";
import BarLoader from "react-spinners/BarLoader";

const override = css`
  display: block;
  margin: 20px auto;
  border-color: #0a66c2;
`;

const LoadingModal = ({ loading }) => {
  let [color, setColor] = useState("#0a66c2");
  return (
    <div className="loading-modal">
      <div className="loading-modal__loader">
        <p>Linked</p>
        <GrLinkedin className="loading-modal__loader-logo" />
      </div>
      <BarLoader
        height={4}
        width={150}
        color={color}
        loading={loading}
        css={override}
      />
    </div>
  );
};

export default LoadingModal;
