import React from "react";
import { useSelector } from "react-redux";
import "./HeaderOption.css";

const HeaderOption = ({
  Icon,
  title,
  color,
  onClick,
  notifications,
  length,
}) => {
  const { newNotifications, newNotificationsAmount } = useSelector(
    (state) => state.notifications
  );

  return (
    <div className="headerOption" role="button" onClick={onClick}>
      {Icon && (
        <span className="headerOptions-icons">
          <Icon style={color && { color }} className="headerOption__icon" />
          {notifications && newNotificationsAmount > 0 && (
            <span className="headerOptionNotifications">
              {!length && newNotificationsAmount > 0 && newNotificationsAmount}
              {length && length}
            </span>
          )}
        </span>
      )}
      <p className="headerOption__title">{title}</p>
    </div>
  );
};

export default HeaderOption;
