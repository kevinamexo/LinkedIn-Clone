import React, { useEffect, useState } from "react";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import {
  setAddToConnectionRequests,
  removeFromRequests,
} from "../../redux/features/connectionRequestsSlice";
import Skeleton from "react-loading-skeleton";
import "./ConnectionRequest.css";
import { FaUserCircle } from "react-icons/fa";

const ConnectionRequests = ({ request, key, newConnectionRequest }) => {
  const [userOb, setUserOb] = useState({});
  const [loading, setLoading] = useState(null);
  const { userObj } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fetchUser = async (user_name) => {
    //check if object is already in store
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
        username: doc.data().username,
      };

      setUserOb(userObject);

      return userObject;
    });
  };

  useEffect(() => {
    console.log(request.username);
    setLoading(true);
    fetchUser(request.username).then(() => {
      setLoading(false);
      console.log("DONE FETCHING USER DETAILS");
    });
  }, [request]);

  const acceptConnectionRequest = async (userOb, accept) => {
    dispatch(removeFromRequests(key));
    const connectionRequestsQuery = query(
      collection(db, "connectionRequests"),
      where("username", "==", userObj.username)
    );
    const connectionRequestsSnap = await getDocs(connectionRequestsQuery);
    let connectionRequestDocId;
    connectionRequestsSnap.forEach((doc) => {
      connectionRequestDocId = doc.id;
      console.log(doc.data());
    });
    const followQuery = query(
      collection(db, "follows"),
      where("username", "==", userObj.username)
    );
    const followSnap = await getDocs(followQuery);
    let followDocId;
    followSnap.forEach((doc) => {
      followDocId = doc.id;
    });
    const followDocRef = doc(db, "follows", followDocId);
    const connectionRequestsDocRef = doc(
      db,
      "connectionRequests",
      connectionRequestDocId
    );
    console.log(connectionRequestDocId);
    console.log(request);
    await updateDoc(connectionRequestsDocRef, {
      connectionRequests: arrayRemove(request),
    });
    const notificationsQuery = query(
      collection(db, "follows"),
      where("username", "==", userObj.username)
    );
    const notificationsDocSnap = await getDocs(notificationsQuery);
    let notificationsDocId;
    notificationsDocSnap.forEach((doc) => {
      notificationsDocId = doc.id;
    });
    const notificationsDocRef = doc(db, "follows", notificationsDocId);

    if (accept === true) {
      await updateDoc(followDocRef, {
        users: arrayUnion(userOb.username),
      });
      await updateDoc(notificationsDocRef, {
        users: arrayUnion(userOb.username),
      });
    } else if (accept === false) {
      await updateDoc(followDocRef, {
        users: arrayRemove(userOb.username),
      });
    }
  };

  return (
    <>
      <div
        className={`connection-requests ${
          newConnectionRequest === true && "newRequest"
        }`}
      >
        <div className="connection-requests__main">
          <div className="connectionReq__section1">
            {loading === false && userOb && userOb.profilePhotoURL && (
              <img src={userOb.profilePhotoURL} />
            )}
            {loading === false && userOb && !userOb.profilePhotoURL && (
              <FaUserCircle className="connectionReq__profilePic" />
            )}

            {loading === true && (
              <Skeleton
                className="connectionReq__profilePic"
                circle="true"
                height={50}
                width={50}
              />
            )}
          </div>
          <div className="connectionReq__section2">
            {loading === false && (
              <>
                <p>
                  {userOb &&
                    userOb.name &&
                    `${userOb.name.firstName} ${userOb.name.lastName}`}
                </p>
                <p className="user-title">{userOb.title}</p>
                <span>
                  <button
                    onClick={() => acceptConnectionRequest(userOb, false)}
                  >
                    Ignore{" "}
                  </button>
                  <button
                    type="button"
                    onClick={() => acceptConnectionRequest(userOb, true)}
                  >
                    Accept
                  </button>
                </span>
              </>
            )}
            {loading === true && (
              <>
                <Skeleton width={100} height={10} />
                <Skeleton
                  width={250}
                  height={10}
                  style={{ marginTop: "0px" }}
                />
                <Skeleton
                  width={250}
                  height={10}
                  style={{ marginTop: "0px" }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConnectionRequests;
