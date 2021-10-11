import React from "react";
import { useSelector } from "react-redux";
import "./NotificationsPage.css";
import Notification from "../../components/notifications/Notification";
const NotificationsPage = () => {
  const { newNotifications, pastNotifications, newNotificationsAmount } =
    useSelector((state) => state.notifications);
  const notificationsMessage =
    newNotificationsAmount === 0
      ? `You're all caught up! Check back later for new Notifications`
      : `You have ${newNotificationsAmount} new notifications`;
  return (
    <div className="notificationsPage">
      <div className="notificationSections">
        <div className="notifications__section1">
          <div className="notifications-status">
            <p className="notificationStatus1">Notifications</p>
            <p className="notificationStatus2">{notificationsMessage}</p>
          </div>
        </div>
        <div className="notifications__section2">
          <div className="NotificationsList">
            {newNotifications &&
              newNotifications.map((n, key) => (
                <Notification
                  key={key}
                  newNotification={true}
                  notification={n}
                />
              ))}
            {pastNotifications &&
              pastNotifications.map((n, key) => (
                <Notification
                  key={key}
                  newNotification={false}
                  notification={n}
                />
              ))}
          </div>
        </div>
        <div className="notifications__section3"></div>
      </div>
    </div>
  );
};

export default NotificationsPage;
