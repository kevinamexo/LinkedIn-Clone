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
} from "firebase/firestore";
import userSlice, {
  setActiveUser,
  setUserLogoutState,
  setActiveUserObj,
  setLoading,
  setSearchActive,
} from "./redux/features/userSlice";
import { setShowContactCardModal } from "./redux/features/modalsSlice";

import { onAuthStateChange } from "firebase/auth";

function App() {
  const dispatch = useDispatch();
  const { user, userObj, isAuth, loading } = useSelector((state) => state.user);
  const { modalActive, showContactCardModal } = useSelector(
    (state) => state.modals
  );
  const [authenticated, setAuthenticated] = useState(null);

  const fetchUserDetails = async (db, userEmail) => {
    const q = query(collection(db, "user"), where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      dispatch(setActiveUserObj(doc.data()));
    });
  };

  const handleLogout = () => dispatch(setUserLogoutState());
  // const handleLogin=()=>{

  //   fetchUserDetails
  // }

  useEffect(() => {
    const subscribe = auth.onAuthStateChanged((user) => {
      dispatch(setLoading(true));
      if (user) {
        fetchUserDetails(db, user.email);
      } else {
        handleLogout();
      }
    });
  }, []);

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
