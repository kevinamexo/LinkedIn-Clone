import React from "react";
import "./HeaderOption.css";
const HeaderOption = ({ Icon, title, color, onClick }) => {
  return (
    <div className="headerOption" role="button" onClick={onClick}>
      {Icon && (
        <Icon style={color && { color }} className="headerOption__icon" />
      )}
      <p className="headerOption__title">{title}</p>
    </div>
  );
};

export default HeaderOption;
