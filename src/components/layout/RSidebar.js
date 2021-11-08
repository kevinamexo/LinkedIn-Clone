import React, { useEffect } from "react";
import "./RSidebar.css";
import AddToFeedItem from "./AddToFeedItem";
import { useSelector, useDispatch } from "react-redux";
import { query, collection, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { setOtherUsers } from "../../redux/features/otherUsersSlice";
const addToFeedItems = [
  {
    name: "Tony Robbins",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1257396956881498114/Fj13PSh-_400x400.jpg",
    summary: "#1 New York Times best-selling author",
    verified: true,
  },
  {
    name: "Tony Robbins",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1257396956881498114/Fj13PSh-_400x400.jpg",
    summary: "#1 New York Times best-selling author",
    verified: true,
  },
  {
    name: "Tony Robbins",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1257396956881498114/Fj13PSh-_400x400.jpg",

    summary: "#1 New York Times best-selling author",
    verified: true,
  },
];

const RSidebar = () => {
  const { userObj } = useSelector((state) => state.user);
  const { otherUsersArr } = useSelector((state) => state.otherUsers);
  const dispatch = useDispatch();
  const fetchOtherUsers = async () => {
    const otherUsersQuery = query(
      collection(db, "user"),
      where("username", "!=", userObj.username),
      limit(3)
    );
    const otherUsersSnap = await getDocs(otherUsersQuery);
    const tmpOtherUsers = [];
    otherUsersSnap.forEach((doc) => {
      tmpOtherUsers.push(doc.data());
    });
    dispatch(setOtherUsers(tmpOtherUsers));
  };

  useEffect(() => {
    fetchOtherUsers();
  }, []);
  return (
    <div className="RSidebar">
      <div className="addToFeed">
        <span className="addToFeed__header">
          <p>View other profiles</p>
          <p>+</p>
        </span>
        {otherUsersArr &&
          otherUsersArr.map((user, idx) => (
            <AddToFeedItem user={user} key={idx} />
          ))}
      </div>
    </div>
  );
};

export default RSidebar;
