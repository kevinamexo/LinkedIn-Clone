import React, { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";

import Header from "./components/layout/Header";
import Main from "./pages/main/Main";
import CreatePostModal from "./components/modals/CreatePostModal";
import LoginPage from "./pages/login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import TestPage from "./pages/TestPage";
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
import {
  setConnectionRequests,
  setLoadingConnectionRequests,
  setAddToConnectionRequests,
  setRequestsFetchMade,
  setLastViewedRequests,
} from "./redux/features/connectionRequestsSlice";

import { onAuthStateChange } from "firebase/auth";
import { connect } from "react-redux";

function App() {
  const dispatch = useDispatch();
  const { user, userObj, isAuth, loading } = useSelector((state) => state.user);
  const { modalActive, showContactCardModal } = useSelector(
    (state) => state.modals
  );
  const { connectionRequests, initialRequestsFetchMade, lastViewedRequests } =
    useSelector((state) => state.connectionRequests);
  const [authenticated, setAuthenticated] = useState(null);
  const [loadingConnectionRequests, setLoadingConnectionRequests] =
    useState(null);
  let username;
  let connectionRequestsTmp;
  const [initialConnectionsFetch, setInitialConnectionFetch] = useState(false);
  let lastViewReq;

  const fetchConnectionRequests = async () => {
    setLoadingConnectionRequests(true);
    const connectionRequestQuery = query(
      collection(db, "connectionRequests"),
      where("username", "==", userObj.username)
    );
    const connectionRequestListen = onSnapshot(
      connectionRequestQuery,
      (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type !== "remeeoved" && change.doc.data()) {
            console.log("added or modified");
            let fullConnectionRequestsSnap = [];
            let fullConnectionRequestsSnapWithDate = [];
            // if (connectionRequests.length === 0) {
            //   dispatch(setLoadingConnectionRequests(true));
            // }
            console.log(lastViewedRequests);
            if (lastViewedRequests === null) {
              console.log("INITIAL CONNECTION FETCH");
            }
            ///FETCGH FULL CONNECTION REQUESTS ARRAY
            querySnapshot.forEach((doc) => {
              console.log(doc.data());
            });
            querySnapshot.docChanges().forEach((change) => {
              console.log(change.doc.data().connectionRequests);
              if (change.doc.data().lastConnectionRequest) {
                dispatch(
                  setLastViewedRequests(change.doc.data().lastConnectionRequest)
                );
                fullConnectionRequestsSnap.push(
                  ...change.doc.data().connectionRequests
                );
              }
            });

            function comparer(otherArray) {
              return function (current) {
                return (
                  otherArray.filter(function (other) {
                    return (
                      other.username === current.username &&
                      other.published === current.published
                    );
                  }).length == 0
                );
              };
            }
            console.log(connectionRequests);
            const results = fullConnectionRequestsSnap.filter(
              ({ username: id1 }) =>
                !connectionRequests.some(({ username: id2 }) => id2 === id1)
            );
            console.log(results);

            dispatch(setAddToConnectionRequests(results));
          }
          if (change.type === "removed") {
            console.log("connection request removued");
            console.log(change.doc);
          }
        });
      }
    );
  };

  const fetchUserDetails = async (db, userEmail) => {
    try {
      console.log("FETCHING USER DETAILS");
      const q = query(collection(db, "user"), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log("doc data");
        dispatch(setActiveUserObj(doc.data()));
        username = doc.data().username;
      });
    } catch (e) {
      handleLogout("/");
    }
  };

  const start = async (user) => {
    await fetchUserDetails(db, user.email);
  };

  const handleLogout = () => dispatch(setUserLogoutState());

  useEffect(() => {
    const subscribe = auth.onAuthStateChanged((user) => {
      dispatch(setLoading(true));
      if (user) {
        start(user);
        console.log(user.uid);
        console.log(user);
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
