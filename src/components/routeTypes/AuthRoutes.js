import React, { useState, useEffect } from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { auth } from "../../firebase/firebaseConfig";
import LoadingModal from "../modals/LoadingModal";
const AuthRoute = ({ authState, ccmponent: Component, ...rest }) => {
  const location = useLocation();
  const { user, userObj, isAuth, loading } = useSelector((state) => state.user);
  const [auth, setAuth] = useState(null);
  let i;
  let flag = null;
  useEffect(() => {
    let i = isAuth;
    console.log("I IS " + i);
    setAuth(i);

    return () => {
      setAuth(null);
    };
  }, []);

  return (
    <>
      {auth === false ? (
        <Route
          {...rest}
          render={(routeProps) => <Component {...routeProps} />}
        />
      ) : auth === true ? (
        <Redirect to={{ pathname: "/", state: { from: location } }} />
      ) : (
        <LoadingModal loading={true} />
      )}
    </>
  );
};

export default AuthRoute;
