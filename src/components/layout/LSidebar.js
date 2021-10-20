import React, { useState } from "react";
import { db } from "../../firebase/firebaseConfig";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { collection } from "firebase/firestore";
import { VscChevronDown } from "react-icons/vsc";
import "./LSidebar.css";

const LSidebar = () => {
  const { user, userObj } = useSelector((state) => state.user);

  const userRef = collection(db, "user");
  const [userHeader, setUserHeader] = useState({
    name: null,
    coverPhotoURL: null,
    profilePhotoURL: null,
  });
  const [loading, setLoading] = useState(null);

  return (
    <div className="LSidebar">
      <div className="LSidebar-widget1">
        <div className="LSidebar-coverImage-container">
          {userObj && userObj.coverPhotoURL ? (
            <img className="LSidebar-coverImage" src={userObj.coverPhotoURL} />
          ) : (
            <img
              className="LSidebar-coverImage"
              src="https://wallpaperaccess.com/full/1285952.jpg"
            />
          )}
        </div>
        <div className="LSidebar-profile-photo">
          <img
            src={
              userObj && userObj.profilePhotoURL
                ? userObj.profilePhotoURL
                : "https://cdn.landesa.org/wp-content/uploads/default-user-image.png"
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
