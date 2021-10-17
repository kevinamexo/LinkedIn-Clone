import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import "./HeaderOption.css";

const HeaderOption = ({
  Icon,
  title,
  color,
  onClick,
  notifications,
  length,
  type,
}) => {
  const { newNotifications, newNotificationsAmount } = useSelector(
    (state) => state.notifications
  );
  const { newConnectionRequests } = useSelector(
    (state) => state.connectionRequests
  );
  useEffect(() => {
    console.log("TYPEEE");
    console.log(type);
  }, []);

  return (
    <div className="headerOption" role="button" onClick={onClick}>
      {Icon && (
        <span className="headerOptions-icons">
          <Icon style={color && { color }} className="headerOption__icon" />
          {notifications && newNotificationsAmount > 0 && (
            <span className="headerOptionNotifications">
              {type === "notifications" &&
                newNotificationsAmount > 0 &&
                newNotificationsAmount}
              {type === "connectionRequests" &&
                newConnectionRequests > 0 &&
                newConnectionRequests.length}
              {/* {type==='connectionRequests' && newConnectionRequests > 0 && newConnectionRequest} */}
            </span>
          )}
        </span>
      )}
      <p className="headerOption__title">{title}</p>
    </div>
  );
};

export default HeaderOption;
