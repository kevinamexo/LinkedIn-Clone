import React from "react";
import "./HeaderOption.css";
const HeaderOption = ({ Icon, title, color }) => {
  return (
    <div className="headerOption" role="button">
      {Icon && (
        <Icon style={color && { color }} className="headerOption__icon" />
      )}
      <p className="headerOption__title">{title}</p>
    </div>
  );
};

export default HeaderOption;
