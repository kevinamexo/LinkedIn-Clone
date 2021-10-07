import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Notification.css";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
function compareTime(time1, time2) {
  return new Date(time1) > new Date(time2); // true if time1 is later
}
const Notification = ({ notification }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [newNotification, setNewNotification] = useState(null);
  const [notificationUser, setNotificationUser] = useState(null);
  const [loading, setLoading] = useState(null);
  const { notifications, lastNotification } = useSelector(
    (state) => state.notifications
  );

  const fetchProfileDetails = async () => {
    if (notification.authorId) {
      // setLoading(true);
      const userQ = query(
        collection(db, "user"),
        where("username", "==", notification.authorId)
      );

      const userSnap = await getDocs(userQ);

      userSnap.forEach((doc) => {
        setNotificationUser(doc.data().profilePhotoURL || null);
      });
      // setLoading(false);
    }
    console.log("FETCHED NOTIFICATION USER");
  };
  const checkNotificationStatus = (notification) => {
    console.log("FULL NOTIFICATION");
    console.log(notification);
    setLoading(true);
    console.log("lastNoti");
    console.log(lastNotification);
    console.log("notification time");
    if (notification.postText) console.log(notification.postText);
    let t = new Date(notification.published.seconds * 1000);
    console.log(t);
    if (t >= lastNotification) {
      setNewNotification(true);
      console.log("GREATER");
    } else if (t <= lastNotification) {
      console.log("LESS");
      setNewNotification(false);
    }
    setLoading(false);
  };

  const getNotification = async () => {
    await fetchProfileDetails().then(() =>
      checkNotificationStatus(notification)
    );
  };
  useEffect(() => {
    console.log("notification");
    getNotification();

    return () => {
      notification = {};
      setNewNotification(null);

      setNotificationUser({});
      let t = null;
    };
  }, []);

  const generateNotificationText = () => {
    switch (notification.postType) {
      case "text":
        return (
          <p className="notificationSummary">
            {/* <Link to={`/in/${notification.authorId}`}> */}
            <b onClick={() => history.push(`/in/${notification.authorId}`)}>
              {notification.name}
            </b>{" "}
            {/* </Link> */}
            shared a post: "{notification.postText.substring(0, 10)} ...";
          </p>
        );
      default:
        return notification.postText;
    }
  };

  if (loading === false) {
    return (
      <div
        className={`${newNotification ? "newNotification" : "oldNotification"}`}
      >
        <img
          className="notification-profilePhoto"
          src={
            notificationUser ||
            "https://cdn.landesa.org/wp-content/uploads/default-user-image.png"
          }
          alt={notification.authorId}
        />

        {generateNotificationText()}
      </div>
    );
  } else return null;
};

export default Notification;
