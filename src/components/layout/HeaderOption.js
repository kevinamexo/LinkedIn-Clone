import React from "react";
import { useSelector } from "react-redux";
import "./HeaderOption.css";
const HeaderOption = ({ Icon, title, color, onClick, notifications }) => {
  const { newNotifications } = useSelector((state) => state.notifications);

  return (
    <div className="headerOption" role="button" onClick={onClick}>
      {Icon && (
        <span className="headerOptions-icons">
          <Icon style={color && { color }} className="headerOption__icon" />
          {newNotifications && newNotifications.length > 0 && (
            <span className="headerOptionNotifications">
              {newNotifications.length}
            </span>
          )}
        </span>
      )}
      <p className="headerOption__title">{title}</p>
    </div>
  );
};

export default HeaderOption;
