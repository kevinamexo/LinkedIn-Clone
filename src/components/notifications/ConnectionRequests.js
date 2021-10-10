import React, { useEffect, useState } from "react";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useDispatch } from "react-redux";
import { setAddToConnectionsRequests } from "../../redux/features/connectionRequestsSlice";
import Skeleton from "react-loading-skeleton";
import "./ConnectionRequest.css";
import { FaUserCircle } from "react-icons/fa";

const ConnectionRequests = ({ request }) => {
  const [userObj, setUserObj] = useState({});
  const [loading, setLoading] = useState(null);
  const dispatch = useDispatch();
  const fetchUser = async (user_name) => {
    const userQuery = query(
      collection(db, "user"),
      where("username", "==", user_name)
    );
    const userSnapshot = await getDocs(userQuery);
    userSnapshot.forEach((doc) => {
      console.log("fetched" + doc.data().username);
      const userObject = {
        name: doc.data().name,
        summary: doc.data().summary,
        title: doc.data().title,
        verified: doc.data().verified,
        location: doc.data().location,
      };
      dispatch(setAddToConnectionsRequests(userObject));
      // setLoadingConnectionRequests(false);
      return userObject;
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchUser(request.username).then((uO) => {
      setUserObj(uO);
      setLoading(false);
      console.log("DONE FETCHING USER DETAILSS");
    });
  }, [request]);

  return (
    <>
      <div className="connection-requests">
        {loading === false && (
          <>
            <div className="connectionReq__section2">
              {userObj && userObj.profilePhotoUrl ? (
                <img src={userObj.profilePhotoUrl} />
              ) : (
                <FaUserCircle className="connectionReq__profilePic" />
              )}
            </div>
            <div className="connectionReq__section2">
              <p>{request.username}</p>
            </div>
          </>
        )}
        {loading === true && <p>Loading</p>}
      </div>
    </>
  );
};

export default ConnectionRequests;
