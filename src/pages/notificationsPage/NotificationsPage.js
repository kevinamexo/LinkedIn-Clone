import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./NotificationsPage.css";
import Notification from "../../components/notifications/Notification";
import { resetNewNotifications } from "../../redux/features/notificationsSlice";
import { Timestamp } from "firebase/firestore";
const NotificationsPage = () => {
  const dispatch = useDispatch();
  const {
    newNotifications,
    pastNotifications,
    prevNewNotifications,
    prevPastNotifications,
  } = useSelector((state) => state.notifications);
  const notificationsMessage =
    newNotifications.length < 1
      ? `You're all caught up! Check back later for new Notifications`
      : `You have ${newNotifications.length} new notifications`;
  useEffect(() => {
    return () => {
      let date = new Date();
      let timestamp = Timestamp.fromDate(date);
      dispatch(resetNewNotifications());
    };
  }, []);

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
            {prevNewNotifications &&
              prevNewNotifications.map((n, key) => (
                <Notification
                  key={key}
                  newNotification={true}
                  notification={n}
                />
              ))}
            {prevPastNotifications &&
              prevPastNotifications
                .slice(0, 10)
                .map((n, key) => (
                  <Notification
                    key={key}
                    newNotification={false}
                    notification={n}
                  />
                ))}
          </div>
        </div>
        <div className="notifications__section3">
          <div className="notifications__section3-ad">
            <img
              src="https://image.freepik.com/free-photo/two-happy-men-working-together-new-business-project_171337-7319.jpg"
              alt="ad"
            />
            <div className="title">Your dream job is closer than you think</div>
            <button className="seeJobs">See jobs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
