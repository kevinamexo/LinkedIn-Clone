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
  addNewNotifications,
  setInitialNotificationTime,
} from "../../redux/features/notificationsSlice";
import { setAddToPosts } from "../../redux/features/postsSlice";
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
  const [loadingPosts, setLoadingPosts] = useState(null);
  const { lastNotification } = useSelector((state) => state.notifications);
  const { posts, lastPost, sortedPosts } = useSelector((state) => state.posts);
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
  const getPosts = () => {
    setLoadingPosts(true);
    const postsQuery = query(
      collection(db, "follows"),
      where("users", "array-contains", userObj.username)
    );
    const postsSnapshot = onSnapshot(postsQuery, (querySnapshot) => {
      let postsArr = [];
      querySnapshot.docChanges().forEach((change) => {
        if (change.type !== "removed" && change.doc.data()) {
          postsArr.push(...change.doc.data().recentPosts);
        }
      });
      console.log("New items are:");
      console.log(postsArr);
      const postsArr2 = postsArr.sort((a, b) => {
        return new Date(b.published) - new Date(a.published);
      });
      console.log(postsArr2[0]);
      console.log(posts);

      dispatch(setAddToPosts(postsArr));
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
