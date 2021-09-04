import { Route, Redirect, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { auth } from "../../firebase/firebaseConfig";
import LoadingModal from "../LoadingModal";
const PrivateRoute = ({ component: Component, authState, ...rest }) => {
  const location = useLocation();
  const { user, userObj, isAuth, loading } = useSelector((state) => state.user);
  const [auth, setAuth] = useState(null);
  let i;
  let flag = null;
  useEffect(() => {
    let i = isAuth;
    console.log("I IS " + i);
    setAuth(i);
  }, []);

  return (
    <>
      {auth ? (
        <Route
          {...rest}
          render={(routeProps) => <Component {...routeProps} />}
        />
      ) : auth === false ? (
        <Redirect to={{ pathname: "/login", state: { from: location } }} />
      ) : (
        <LoadingModal loading={true} />
      )}
    </>
  );
};
export default PrivateRoute;
