import React, { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";

import Header from "./components/layout/Header";
import Main from "./pages/main/Main";
import CreatePostModal from "./components/modals/CreatePostModal";
import LoginPage from "./pages/login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import ProfilePage from "./pages/profilepage/ProfilePage";
import ContactInfoModal from "./components/modals/ContactInfoModal";
import LoadingModal from "./components/modals/LoadingModal";
import "./App.css";
import PrivateRoute from "./components/routeTypes/PrivateRoute";
import AuthRoute from "./components/routeTypes/AuthRoutes";
import { db, auth } from "./firebase/firebaseConfig";
import {
  collection,
  onSnapShot,
  where,
  query,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import userSlice, {
  setActiveUser,
  setUserLogoutState,
  setActiveUserObj,
  setLoading,
  setSearchActive,
} from "./redux/features/userSlice";
import { setShowContactCardModal } from "./redux/features/modalsSlice";
import { setLastNotificationTime } from "./redux/features/notificationsSlice";
import { setConnectionRequests } from "./redux/features/connectionRequestsSlice";

import { onAuthStateChange } from "firebase/auth";

function App() {
  const dispatch = useDispatch();
  const { user, userObj, isAuth, loading } = useSelector((state) => state.user);
  const { modalActive, showContactCardModal } = useSelector(
    (state) => state.modals
  );
  const { connectionRequests } = useSelector(
    (state) => state.connectionRequests
  );
  const [authenticated, setAuthenticated] = useState(null);

  let username;

  const lastNotification = async () => {
    console.log("FETCHING LAST NOTIFICATION");
    const lastNotificationQuery = query(
      collection(db, "user"),
      where("username", "==", userObj.username)
    );
    const fetchLastNotificationTime = onSnapshot(
      lastNotificationQuery,
      (querySnapshot) => {
        console.log("NOTIFICATIONS SNAPSOT");
        querySnapshot.forEach((doc) => {
          console.log("NEW NOFI");
          console.log(doc.data().lastNotification);
          dispatch(setLastNotificationTime(doc.data.lastNotification));
        });
      }
    );
  };
  const fetchConnectionRequests = async () => {
    const connectionRequestQuery = query(
      collection(db, "follows"),
      where("username", "==", userObj.username)
    );
    const connectionRequestListen = onSnapshot(
      connectionRequestQuery,
      (querySnapshot) => {
        console.log("NEW CONNECTION REQUEST");
        if (connectionRequests.length === 0) {
          querySnapshot.forEach((doc) => {
            if (doc.data().connectionRequests.length !== connectionRequests) {
              dispatch(setConnectionRequests(doc.data().connectionRequests));
            }
          });
        }
      }
    );
  };

  const fetchUserDetails = async (db, userEmail) => {
    const q = query(collection(db, "user"), where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      dispatch(setActiveUserObj(doc.data()));
      username = doc.data().username;
    });
  };

  const start = async (user) => {
    await fetchUserDetails(db, user.email);
  };

  const handleLogout = () => dispatch(setUserLogoutState());
  // const handleLogin=()=>{

  //   fetchUserDetails
  // }

  useEffect(() => {
    const subscribe = auth.onAuthStateChanged((user) => {
      dispatch(setLoading(true));
      if (user) {
        start(user);
      } else if (!user) {
        handleLogout();
      }
    });
  }, []);

  useEffect(() => {
    if (userObj) {
      fetchConnectionRequests();
    }
  }, [userObj]);

  useEffect(() => {
    if (userObj && userObj.username) lastNotification();
  }, [userObj]);
  return (
    <div
      className={modalActive ? "appModal" : "app"}
      style={
        modalActive === true
          ? { height: "100vh", overflow: "hidden" }
          : { height: "100%" }
      }
    >
      {loading === true ? (
        <LoadingModal loading={true} />
      ) : (
        <Switch>
          <AuthRoute
            authState={authenticated}
            exact
            path="/register"
            component={SignupPage}
          />
          <AuthRoute
            authState={authenticated}
            exact
            path="/login"
            component={LoginPage}
          />
          <PrivateRoute authState={authenticated} path="/" component={Main} />
        </Switch>
      )}
    </div>
  );
}

export default App;
