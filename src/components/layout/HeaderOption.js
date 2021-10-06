import React from "react";
import "./HeaderOption.css";
const HeaderOption = ({ Icon, title, color, onClick, notifications }) => {
  return (
    <div className="headerOption" role="button" onClick={onClick}>
      {Icon && (
        <span className="headerOptions-icons">
          <Icon style={color && { color }} className="headerOption__icon" />
          {notifications && notifications.length > 0 && (
            <span className="headerOptionNotifications">
              {notifications.length}
            </span>
          )}
        </span>
      )}
      <p className="headerOption__title">{title}</p>
    </div>
  );
};

export default HeaderOption;
