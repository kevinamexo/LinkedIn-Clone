import React from "react";

import "./Main.css";
import Header from "../../components/layout/Header";
import MainSection from "../../components/layout/MainSection";
import RSidebar from "../../components/layout/RSidebar";
import LSidebar from "../../components/layout/LSidebar";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import ProfilePage from "../profilepage/ProfilePage";
const Main = () => {
  const { path } = useRouteMatch();
  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/in/:username/">
          <ProfilePage />
        </Route>
        <Route exact path={path}>
          <div className="main-page">
            <LSidebar />
            <MainSection />
            <RSidebar />
          </div>
        </Route>
      </Switch>
    </>
  );
};

export default Main;
