import React, { useState, useEffect } from "react";
import PostPage from "../postPage/PostPage";
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
  setNotificationAndPageViews,
  setInitialNotificationTime,
  setLastNotificationTime,
  modifyNotificationsChange,
} from "../../redux/features/notificationsSlice";
import {
  setAddToPosts,
  setRemoveFromPosts,
} from "../../redux/features/postsSlice";
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
import { remove } from "@firebase/database";

const Main = () => {
  const { path } = useRouteMatch();
  const { userObj } = useSelector((state) => state.user);
  const [loadingPosts, setLoadingPosts] = useState(null);
  const { lastNotification } = useSelector((state) => state.notifications);
  const { posts, lastPost, sortedPosts } = useSelector((state) => state.posts);
  const dispatch = useDispatch();

  let tmpNotifications, modifiedNotifications;

  const userNotificationsDocQuery = query(
    collection(db, "notifications"),
    where("username", "==", userObj.username)
  );
  const initNotifications = async () => {
    console.log("ADDDING INITIAL NOTIFICATIONS");
    const userNotificationSnap = await getDocs(userNotificationsDocQuery);
    userNotificationSnap.forEach((doc) => {
      dispatch(setInitialNotificationTime(doc.data().lastNotification));
    });
  };

  useEffect(() => {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("users", "array-contains", userObj.username)
    );
    initNotifications();

    ///setInitialNotificationTime
    const lastNotificationTimeSnap = onSnapshot(
      userNotificationsDocQuery,
      (querySnapshot) => {
        console.log("NOTIFICATION TIME SNAPSHOT");
        querySnapshot.docChanges().forEach((change) => {
          if (change.type !== "removed") {
            dispatch(
              setLastNotificationTime(change.doc.data().lastNotification)
            );
          }
        });
      }
    );

    let type;
    const notificationsSnap = onSnapshot(
      notificationsQuery,
      (querySnapshot) => {
        console.log("NOTIFICATION SNAPSHT CAPTURED");
        tmpNotifications = [];
        modifiedNotifications = [];

        querySnapshot.docChanges().forEach((change) => {
          console.log(change.type);
          console.log(change.doc.data().notifications);
          if (change.type === "added") {
            type = "initial";
            tmpNotifications = [
              ...tmpNotifications,
              ...change.doc
                .data()
                .notifications.filter((n) => n.authorId !== userObj.username),
            ];
            console.log("tmpNotifications is now");
            console.log(tmpNotifications);
          } else if (change.type === "modified") {
            type = "modify";
            modifiedNotifications = [
              ...modifiedNotifications,
              ...change.doc
                .data()
                .notifications.filter((n) => n.authorId !== userObj.username),
            ];
          }
        });
        if (type === "initial") {
          type = dispatch(
            setNotificationAndPageViews({
              notifications: tmpNotifications,
            })
          );
        } else if (type === "modify") {
          dispatch(modifyNotificationsChange(modifiedNotifications));
        }
        type = "";
      }
    );

    return () => {
      lastNotificationTimeSnap();
      notificationsSnap();
    };
  }, [userObj.username]);

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
    followersListener();
  }, [userObj]);

  const getPosts = () => {
    setLoadingPosts(true);
    const postsQuery = query(
      collection(db, "follows"),
      where("users", "array-contains", userObj.username)
    );
    const postsSnapshot = onSnapshot(postsQuery, (querySnapshot) => {
      let postsArr = [];
      let removedPosts = [];
      querySnapshot.docChanges().forEach((change) => {
        if (change.type !== "removed" && change.doc.data()) {
          console.log("ADDING POST");
          postsArr.push(...change.doc.data().recentPosts);
        }
        if (change.type === "removed") {
          console.log("REMOVED POST");
          removedPosts.push(...change.doc.data().recentPosts);
        }
      });
      console.log("New items are:");
      console.log(postsArr);
      console.log(posts);

      console.log("DELETED ITEMS ARE:");
      console.log(removedPosts);
      const postsArr2 = postsArr.sort((a, b) => {
        return (
          new Date(b.published.seconds * 1000) -
          new Date(a.published.seconds * 1000)
        );
      });

      if (postsArr.length > 0) {
        dispatch(setAddToPosts(postsArr2));
      }
    });
    setLoadingPosts(false);
  };

  useEffect(() => {
    getPosts();
    return () => {
      setLoadingPosts(null);
      let followedUsers;
      // dispatch(e([]));
      // let postsSample = [];
    };
  }, []);

  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/messaging/users/:username">
          <Messaging />
        </Route>
        <Route exact path="/posts/:postId">
          <PostPage />
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
