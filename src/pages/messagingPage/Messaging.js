import React, { useState, useEffect } from "react";
import _ from "lodash";
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
import { useSelector, useDispatch } from "react-redux";
import {
  setMessages,
  setAddToMessages,
  setCurrentChatUser,
  setChatRoomId,
  setInitialMessageFetch,
} from "../../redux/features/chatsSlice";

const Messaging = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { userObj } = useSelector((state) => state.user);

  const { currentChatUser, messages, initialMessageFetch } = useSelector(
    (state) => state.chats
  );

  const [messageUserName, setMessageUserName] = useState(null);
  const [messageText, setMessageText] = useState("");
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
        setMessageUserName(name);
        dispatch(setCurrentChatUser(doc.data()));
      });
    });
  }, []);

  useEffect(() => {
    const chatNameStr = [username, userObj.username].sort().join("");
    console.log("chatNameStr");
    console.log(chatNameStr);
    const messageRoomQuery = query(
      collection(db, "chats"),
      where("chatName", "==", chatNameStr)
    );

    const messageRoomSnap = onSnapshot(messageRoomQuery, (messageRoomSnap) => {
      messageRoomSnap.forEach((doc) => {
        if (doc.data()) {
          dispatch(setChatRoomId(doc.id));
          console.log("CHAT ROOM EXISTS");
          console.log(doc.data().chatName);
          ///CURRENT MESSAGES
          console.log(messages);
          // SNAPSHOTMESSAGES
          console.log(doc.data().messages);
          ///CHECK FOR SNAPSHOT MESSAGES NOT IN THE REDUX STORE
          if (initialMessageFetch === null && messages.length === 0) {
            dispatch(setMessages(doc.data().messages));
            dispatch(setInitialMessageFetch());
          } else if (initialMessageFetch === true) {
            let newMessages = _.difference(doc.data().messages, messages);
            newMessages = newMessages.filter(
              (msg) => msg.authorId === username
            );
            dispatch(setAddToMessages(newMessages));
          }
        } else {
          console.log("CHAT ROOM DOES NOT EXIST");
        }
      });
    });
  }, []);

  return (
    <div className="messagesPage">
      <header>
        <div>Messaging</div>
        <span>
          {messageUserName && (
            <>
              <p className="messageUser-name">{messageUserName}</p>
              <p className="messageUser-title">
                {currentChatUser &&
                  currentChatUser.title &&
                  currentChatUser.title}
              </p>
            </>
          )}
        </span>
      </header>
      <div className="messagesPageContainer">
        <div className="messagesPage__otherChats"></div>
        <div className="messagesPage__currentMessages">
          <div className="currentMessage__messages"></div>
          <form className="messageInput-section">
            <input
              className="messageInput"
              name="messageText"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write a message..."
            />
            <button>send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
