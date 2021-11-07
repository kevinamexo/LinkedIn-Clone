import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Notification.css";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

function compareTime(time1, time2) {
  return new Date(time1) > new Date(time2); // true if time1 is later
}
const Notification = ({ notification, newNotification }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [notificationUser, setNotificationUser] = useState(null);
  const [notificationUserObj, setNotificationUserObj] = useState(null);
  const [loading, setLoading] = useState(null);
  const { notifications, lastNotification, prevLastNotification } = useSelector(
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
        setNotificationUser(doc.data().profilePhotoURL);
        setNotificationUserObj(doc.data());
      });
    }
    // console.log("FETCHED NOTIFICATION USER");
  };
  let notificationStatus = null;
  const checkNotificationStatus = (notification) => {
    // if (notification.postText) console.log(notification.postText);
    let t = new Date(notification.published.seconds * 1000);
    console.log(t);
    if (t > prevLastNotification) {
      console.log("NEW_NOTIFICATION");
      notificationStatus = "NEW_NOTIFICATION";

      // console.log("GREATER");
    } else if (t <= prevLastNotification) {
      console.log(t);
      notificationStatus = "OLD_NOTIFICATION";
      console.log("LESS");
      console.log(prevLastNotification);
    }
    setLoading(false);
    console.log(notificationStatus);
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
      setNotificationUser({});
      let t = null;
      // setNewNotification(null);
    };
  }, [notification]);

  useEffect(() => {
    if (notification.published >= prevLastNotification) {
      console.log("NEW RENDERED NOTI");
    } else {
      console.log("OLD NOTI");
    }
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
      case "pageView":
        return (
          <p className="notificationSummary">
            {/* <Link to={`/in/${notification.authorId}`}> */}
            <b onClick={() => history.push(`/in/${notification.authorId}`)}>
              {notification.name}
            </b>{" "}
            {/* </Link> */}
            viewed your profile
          </p>
        );

      default:
        return notification.postText;
    }
  };

  if (loading === false && newNotification !== null) {
    return (
      <div
        className={
          newNotification === true ? "newNotification" : "oldNotification"
        }
      >
        {newNotification === true && (
          <span className="newNotification-tag"></span>
        )}
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
