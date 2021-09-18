import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import useGetUser from "../firebase/hooks/useGetUser";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { collection, query, where, getDoc, getDocs } from "firebase/firestore";
import { VscChevronDown } from "react-icons/vsc";
import "./LSidebar.css";

const LSidebar = () => {
  const { user, userObj } = useSelector((state) => state.user);

  const userRef = collection(db, "user");
  const [userHeader, setUserHeader] = useState({
    name: null,
    coverPhotoUrl: null,
    profilePhotoUrl: null,
  });
  const [loading, setLoading] = useState(null);

  return (
    <div className="LSidebar">
      <div className="LSidebar-widget1">
        <div className="LSidebar-coverImage-container">
          <img
            className="LSidebar-coverImage"
            src={userObj && userObj.coverPhotoURL}
            alt="cover-photo"
          />
        </div>
        <div className="LSidebar-profile-photo">
          <img
            src={
              userObj && userObj.profilePhotoURL !== ""
                ? userObj.profilePhotoURL
                : "https://w7.pngwing.com/pngs/841/727/png-transparent-computer-icons-user-profile-synonyms-and-antonyms-android-android-computer-wallpaper-monochrome-sphere.png"
            }

            // alt="profile-photo"
          />
        </div>
        <div className="LSidebar__greeting">
          <Link to={`/in/${userObj.username}`}>
            <p className="LSidebar__welcome">
              {userObj && `${userObj.name.firstName} ${userObj.name.lastName}`}
            </p>
          </Link>
          <p className="LSidebar__addPhoto">Add a photo </p>
        </div>
        <div className="LSidebar__profileViews">
          <span>
            <p>Connections</p>
            <p className="amount">1</p>
          </span>
          <span>
            <p style={{ color: "black" }}>Grow your network</p>
          </span>
          <span>
            <p>Who viewed your profile</p>
            <p className="amount">33</p>
          </span>
        </div>
        <span className="LSidebar__myItems">
          <p>My Items</p>
        </span>
      </div>
      <span className="LSidebar__showMore">
        <p>Show more</p>
        <VscChevronDown className="showMore__down" />
      </span>

      <div className="LSidebar-widget2"></div>
    </div>
  );
};

export default LSidebar;
