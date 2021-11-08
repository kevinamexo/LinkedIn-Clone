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
  const { newConnectionRequests, connectionRequests } = useSelector(
    (state) => state.connectionRequests
  );
  useEffect(() => {
    console.log("TYPEEE");
    console.log(type);
  }, []);
  useEffect(() => {
    if (length) {
      console.log("LENGTHTHHHH");
      console.log(length.length);
    }
  }, [length]);

  return (
    <div className="headerOption" role="button" onClick={onClick}>
      {Icon && (
        <span className="headerOptions-icons">
          <Icon style={color && { color }} className="headerOption__icon" />
          {type === "notifications" &&
            newNotifications &&
            newNotifications.length > 0 && (
              <span className="headerOptionNotifications-noti">
                {newNotifications.length}
              </span>
            )}
          {type === "connectionRequests" &&
            newConnectionRequests.length > 0 && (
              <span className="headerOptionNotifications-connection">
                {newConnectionRequests.length}
              </span>
            )}
        </span>
      )}
      <p className="headerOption__title">{title}</p>
    </div>
  );
};

export default HeaderOption;
