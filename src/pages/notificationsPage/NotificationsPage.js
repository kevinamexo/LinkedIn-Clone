import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./NotificationsPage.css";
import Notification from "../../components/notifications/Notification";
import { resetFilteredNotifications } from "../../redux/features/notificationsSlice";
import { Timestamp } from "firebase/firestore";
const NotificationsPage = () => {
  const dispatch = useDispatch();
  const [newNotificationsArr, setNewNotificationsArr] = useState([]);
  const [pastNotificationsArr, setPastNotificationsArr] = useState([]);
  const {
    newNotifications,
    pastNotifications,
    prevNewNotifications,
    prevPastNotifications,
    prevNewPageViews,
    prevPastPageViews,
    allNewNotifications,
  } = useSelector((state) => state.notifications);
  const notificationsMessage =
    newNotifications.length < 1
      ? `You're all caught up! Check back later for new Notifications`
      : `You have ${newNotifications.length} new notifications`;

  useEffect(() => {
    const newNotis = [...prevNewNotifications, ...prevNewPageViews].sort(
      (a, b) => {
        return new Date(a.published) - new Date(b.published);
      }
    );
    setNewNotificationsArr(allNewNotifications);
  }, [
    prevNewNotifications,
    prevPastNotifications,
    prevNewPageViews,
    prevPastPageViews,
  ]);

  useEffect(() => {
    return () => {
      dispatch(resetFilteredNotifications());
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
            {newNotificationsArr &&
              newNotificationsArr.map((n, key) => (
                <Notification
                  key={key}
                  newNotification={true}
                  notification={n}
                />
              ))}
            {prevPastNotifications &&
              prevPastPageViews &&
              [...prevPastNotifications, ...prevPastPageViews]
                .sort(
                  (a, b) =>
                    new Date(b.published.seconds * 1000) -
                    new Date(a.published.seconds * 1000)
                )
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
