import React, { useEffect } from "react";

import "./Main.css";
import Header from "../../components/layout/Header";
import MainSection from "../../components/layout/MainSection";
import RSidebar from "../../components/layout/RSidebar";
import LSidebar from "../../components/layout/LSidebar";
import NotificationsPage from "../notificationsPage/NotificationsPage";
import Messaging from "../messagingPage/Messaging";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addNewNotifications,
  setInitialNotificationTime,
} from "../../redux/features/notificationsSlice";
import { setPageViews, setFollowers } from "../../redux/features/userSlice";
import ProfilePage from "../profilepage/ProfilePage";
import TestPage from "../TestPage";
import { db } from "../../firebase/firebaseConfig";
import {
  query,
  collection,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

const Main = () => {
  const { path } = useRouteMatch();
  const { userObj } = useSelector((state) => state.user);
  const { lastNotification } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();

  const notificationsListener = () => {
    if (userObj.username) {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("users", "array-contains", userObj.username)
      );
      const notificationsSnap = onSnapshot(
        notificationsQuery,
        (querySnapshot) => {
          let notifications = [];
          let pageViews = 0;
          querySnapshot.docChanges().forEach((change) => {
            if (change.type !== "removed" && change.doc.data().notifications) {
              notifications.push(
                ...change.doc.data().notifications.filter((n) => {
                  //FOR POSTS
                  if (n.authorId) {
                    return n.authorId !== userObj.username;
                  } else if (n.username) {
                    //FOR PAGE VIEWS
                    return n.username !== userObj.username;
                  }
                })
              );
            }
            if (change.type !== "removed" && change.doc.data().pageViews) {
              notifications.push(
                ...change.doc.data().pageViews.filter((n) => {
                  //FOR POSTS
                  if (n.authorId) {
                    return n.authorId !== userObj.username;
                  } else if (n.username) {
                    //FOR PAGE VIEWS
                    return n.username !== userObj.username;
                  }
                })
              );
              pageViews += change.doc.data().pageViews.length;
            }

            console.log("NOTIFICATIONS WITHOUT MINE");
            console.log(notifications);
          });
          if (lastNotification !== null) {
            if (notifications.length > 0) {
              dispatch(addNewNotifications(notifications));
            }
          }
          dispatch(setPageViews(pageViews));
        }
      );
    }
  };
  const intialNotifications = async () => {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("username", "==", userObj.username)
    );
    const notificationTimeSnap = await getDocs(notificationsQuery);
    notificationTimeSnap.forEach((doc) => {
      dispatch(setInitialNotificationTime(doc.data().lastNotification));
    });
  };
  const followersListener = () => {
    const followersQuery = query(
      collection(db, "follows"),
      where("username", "==", userObj.username)
    );
    const followersSnap = onSnapshot(followersQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().users) {
          dispatch(setFollowers(doc.data().users));
        } else {
          dispatch(setFollowers([]));
        }
      });
    });
  };

  useEffect(() => {
    if (userObj) {
      notificationsListener();
    }
  }, [userObj, lastNotification]);

  useEffect(() => {
    followersListener();
  }, [userObj]);

  useEffect(() => {
    if (lastNotification === null) {
      intialNotifications();
    }
  }, [userObj]);

  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/messaging/users/:username">
          <Messaging />
        </Route>
        <Route exact path="/in/:username/">
          <ProfilePage />
        </Route>
        <Route exact path="/myNotifications">
          <NotificationsPage />
        </Route>
        <Route exact path={path}>
          <div className="main-page">
            <LSidebar />
            <MainSection />
            <RSidebar />
          </div>
        </Route>
        <Route exact path="/test" component={TestPage} />
      </Switch>
    </>
  );
};

export default Main;
