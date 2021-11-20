import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./ReactionUser.css";
import { db } from "../firebase/firebaseConfig";
import { query, collection, where, getDocs } from "firebase/firestore";
import { nameFromObject } from "../customHooks";
import { FaUserCircle } from "react-icons/fa";
const ReactionUser = ({ user }) => {
  const [userObject, setUserObject] = useState({});
  const [showNameTag, setShowNameTag] = useState(false);
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
      {userObject.profilePhotoURL ? (
        <img
          src={userObject.profilePhotoURL}
          alt=""
          onClick={() => history.push(`/in/${userObject.username}`)}
        />
      ) : (
        <FaUserCircle className="reaction-userIcon" />
      )}
      <p className="reaction-userName ">{nameFromObject(userObject)}</p>
    </div>
  );
};

export default ReactionUser;
