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
import {
  setConnectionRequests,
  setAddToConnectionsRequests,
  setRequestsFetchMade,
} from "./redux/features/connectionRequestsSlice";

import { onAuthStateChange } from "firebase/auth";

function App() {
  const dispatch = useDispatch();
  const { user, userObj, isAuth, loading } = useSelector((state) => state.user);
  const { modalActive, showContactCardModal } = useSelector(
    (state) => state.modals
  );
  const { connectionRequests, initialRequestsFetchMade } = useSelector(
    (state) => state.connectionRequests
  );
  const [authenticated, setAuthenticated] = useState(null);
  const [loadingConnectionRequests, setLoadingConnectionRequests] =
    useState(null);
  let username;

  const fetchConnectionRequests = async () => {
    setLoadingConnectionRequests(true);
    const connectionRequestQuery = query(
      collection(db, "follows"),
      where("username", "==", userObj.username)
    );
    const connectionRequestListen = onSnapshot(
      connectionRequestQuery,
      (querySnapshot) => {
        console.log("NEW CONNECTION REQUEST");
        ///INITIAL LOAD
        if (initialRequestsFetchMade === false) {
          let fetchedConnectionRequests = [];
          querySnapshot.docChanges().forEach((change) => {
            //GET A COPY OF CURRENT USERS'S CONNECTION REQUESTS
            if (change.type === "added") {
              fetchedConnectionRequests = [
                ...fetchedConnectionRequests,
                ...change.doc.data().connectionRequests,
              ];

              //CONVERT THE TIMESTAMPS TO DATE
              let fetchedConnectionRequestsWithDate = [];
              fetchedConnectionRequests = fetchedConnectionRequests.forEach(
                (p) => {
                  fetchedConnectionRequestsWithDate = [
                    ...fetchedConnectionRequestsWithDate,
                    { ...p, published: p.published.toDate() },
                  ];
                }
              );
              console.log(fetchedConnectionRequestsWithDate);
              dispatch(
                setConnectionRequests(fetchedConnectionRequestsWithDate)
              );
            }
            dispatch(setRequestsFetchMade(true));
          });
        } else if (connectionRequests.length > 0) {
          let fullConnectionRequestsSnap = [];

          let fullConnectionRequestsSnapWithDate = [];

          ///FETCGH FULL CONNECTION REQUESTS ARRAY
          querySnapshot.forEach((doc) => {
            fullConnectionRequestsSnap.push(...doc.data().connectionRequests);
          });

          ///CHECK FOR NEW connectionRequests
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
          //FIND NEW CONNECTION REQUESTS

          let newRequests = fullConnectionRequestsSnapWithDate.filter(
            ({ username: id1 }) =>
              !connectionRequests.some(({ username: id2 }) => id2 === id1)
          );
          console.log("The new connection requests are:");
          console.log(newRequests);
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
