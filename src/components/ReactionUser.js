import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import "./ReactionUser.css";
import { db } from "../firebase/firebaseConfig";
import { query, collection, where, getDocs } from "firebase/firestore";
import { nameFromObject } from "../customHooks";
import { FaUserCircle } from "react-icons/fa";
const ReactionUser = ({ user }) => {
  const [userObject, setUserObject] = useState({});
  const [showNameTag, setShowNameTag] = useState(false);
  const { userObj } = useSelector((state) => state.user);
  const history = useHistory();
  const getUser = async () => {
    const userQuery = query(
      collection(db, "user"),
      where("username", "==", user)
    );
    const userSnap = await getDocs(userQuery);
    userSnap.forEach((doc) => {
      setUserObject(doc.data());
    });
  };
  useEffect(() => {
    getUser();
  }, [user]);

  useEffect(() => {}, [userObject]);
  return (
    <div className="reactionUser">
      {userObject && userObject.profilePhotoURL ? (
        <img
          src={userObject.profilePhotoURL}
          alt=""
          onClick={() => history.push(`/in/${userObject.username}`)}
          className="reaction-userIcon"
        />
      ) : userObject && !userObject.profilePhotoURL ? (
        <FaUserCircle className="reaction-userIcon" />
      ) : null}
      <p className="reaction-userName ">
        {userObject && userObject.username === userObj.username
          ? "You"
          : nameFromObject(userObject)}
      </p>
    </div>
  );
};

export default ReactionUser;
