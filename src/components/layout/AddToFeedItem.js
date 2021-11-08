import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import "./AddToFeedItem.css";
import { AiOutlinePlus } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";

const AddToFeedItem = ({ user }) => {
  const history = useHistory();
  const { followers } = useSelector((state) => state.user);
  const [following, setFollowing] = useState(null);
  const fullName =
    user.name &&
    `${
      user.name.firstName.charAt(0).toUpperCase() + user.name.firstName.slice(1)
    } ${
      user.name.lastName.charAt(0).toUpperCase() + user.name.lastName.slice(1)
    }`;

  useEffect(() => {
    if (followers !== null) {
      const follower = followers.some((follower) => follower === user.username);
      console.log(follower);
      setFollowing(follower);
    }
  }, [followers, user]);

  return (
    <div className="addToFeed__item">
      <div className="addToFeed__pfp">
        {user.profilePhotoURL ? (
          <img src={user.profilePhotoURL} alt="aaa" className="profilePhoto" />
        ) : (
          <FaUserCircle className="profilePhoto" />
        )}
      </div>
      <div className="addToFeed__details">
        <p
          className="addToFeed__name"
          onClick={() => history.push(`/in/${user.username}`)}
        >
          {fullName}
        </p>
        <p className="addToFeed__summary">
          {user.title || `Connect with ${fullName}`}
        </p>
        {following === false ? (
          <></>
        ) : following === true ? (
          <button className="addToFeed__following">Following</button>
        ) : null}
      </div>
    </div>
  );
};

export default AddToFeedItem;
