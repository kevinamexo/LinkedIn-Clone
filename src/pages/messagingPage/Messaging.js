import React, { useState, useEffect } from "react";
import {
  query,
  where,
  doc,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./MessagesPage.css";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Messaging = () => {
  const { username } = useParams();
  const { userObj } = useSelector((state) => state.user);
  const [messageUser, setMessageUser] = useState({});

  useEffect(() => {
    console.log("LOADING MESSAGESSSSS");
    console.log(username);

    const userQuery = query(
      collection(db, "user"),
      where("username", "==", username)
    );
    const fetchUser = onSnapshot(userQuery, (userSnapshot) => {
      userSnapshot.forEach((doc) => {
        const name =
          doc.data().name &&
          `${
            doc.data().name.firstName.charAt(0).toUpperCase() +
            doc.data().name.firstName.slice(1)
          } ${
            doc.data().name.lastName.charAt(0).toUpperCase() +
            doc.data().name.lastName.slice(1)
          }`;

        setMessageUser(name);
      });
    });
    const chatNameStr= [username, userObj.username].sort().join('')+'chat'
    console.log(chatName)
    // const messageRoomQuery = query(
    //   collection(db, "chats"),
    //   where('chatName','==',chatNameStr)
    //   where("users", "array-contains", username),
    // );



    // const messageRoomSnap = onSnapshot(messageRoomQuery, (messageRoomSnap) => {
    //   messageRoomSnap.forEach((doc) => {
    //     if (doc.data()) {
    //       console.log("CHAT ROOM EXISTS");
    //     } else {
    //       console.log("CHAT ROOM ALEADY EXISTS");
    //     }
    //   });
    // });
  }, []);

  return (
    <div className="messagesPage">
      <p>Messages with </p>
    </div>
  );
};

export default Messaging;
