import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./LastMessageCard.css";
import { FaUserCircle } from "react-icons/fa";
import { setCurrentChatUser } from "../../redux/features/chatsSlice";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
const LastMessageCard = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const {
    userFullNames,
    currentChatUser,
    initialMessageFetch,
    loadingChats,
    currentChatName,
  } = useSelector((state) => state.chats);
  const { userObj, fullName } = useSelector((state) => state.user);
  const [nameSet, setNameSet] = useState(null);
  const [postDate, setPostDate] = useState(null);
  const [otherUserName, setOtherUserName] = useState(null);
  const [otherUserObj, setOtherUserObj] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (currentChatName === chat.chatName) {
      setActiveChat(true);
    } else {
      setActiveChat(false);
    }
  }, [currentChatName, chat]);

  useEffect(() => {
    const handleLastRead = async () => {
      console.log("HANDLING LAST READ");
      const chatRef = doc(db, "chats", chat.id);
      const date = new Date();
      console.log(date);
      const timestamp = Timestamp.fromDate(date);
      await updateDoc(chatRef, {
        [`lastRead${userObj.username}`]: timestamp,
      });
    };
    handleLastRead();
  }, [currentChatUser]);
  useEffect(() => {
    console.log("LAST MESSAGE BY");
    console.log(chat.lastMessage.authorId);
    if (initialMessageFetch === true) {
      let tmpDate = new Date(chat.lastMessage.published).toDateString();
      console.log("DATE");
      console.log(chat.lastMessage);
      setPostDate(tmpDate);
    }
    console.log(chat);
  }, [chat]);

  useEffect(() => {
    console.log("USER FULL NAME");
    console.log(userFullNames);
    const otherUsername = chat.users.filter((x) => x !== userObj.username);
    console.log(otherUsername);
    console.log(userFullNames);
    const nameObj = userFullNames.find((x) => x.username === otherUsername[0]);

    const userFullName =
      nameObj &&
      nameObj.name &&
      `${
        nameObj.name.firstName.charAt(0).toUpperCase() +
        nameObj.name.firstName.slice(1)
      } ${
        nameObj.name.lastName.charAt(0).toUpperCase() +
        nameObj.name.lastName.slice(1)
      }`;
    setNameSet(true);
    console.log(userFullName);
    setOtherUserName(userFullName);
    setOtherUserObj(nameObj);
  }, [userFullNames]);

  //CHECK WHETHER MESSAGE IS NEW OR NOT
  useEffect(() => {
    const lastMessageTime = chat.lastMessage.published;
    const lastReadTime = new Date(
      chat[`lastRead${userObj.username}`].seconds * 1000
    );

    console.log(lastMessageTime);
    console.log(lastReadTime);

    if (lastMessageTime > lastReadTime) {
      console.log("UNREAD MESSAGE");
    }
  }, [chat]);

  const handleMesssageCardClick = async () => {
    const otherUser = chat.users.filter((n) => n !== userObj.username)[0];
    console.log(otherUser);
    window.history.replaceState(
      null,
      "Messages",
      `/messaging/users/${otherUser}`
    );
    dispatch(setCurrentChatUser(otherUser));
  };
  if (loadingChats === false) {
    return (
      <div
        className={
          activeChat ? "lastMessageCard activeChat" : "lastMessageCard"
        }
        onClick={handleMesssageCardClick}
      >
        <div className="lastMessageCard-section1">
          {otherUserObj &&
          otherUserObj.profilePhotoURL !== null &&
          otherUserObj.profilePhotoURL !== "" ? (
            <img src={otherUserObj.profilePhotoURL} className="profilePhoto" />
          ) : (
            <FaUserCircle className="profilePhoto" />
          )}
        </div>
        <div className="lastMessageCard-section2">
          <p>{otherUserName}</p>
          <span>
            <p className="message-name">
              {chat.messages.length === 0
                ? null
                : chat.lastMessage.authorId === userObj.username
                ? "You"
                : otherUserName}
            </p>
            <p
              className={
                chat.messages.length === 0
                  ? "message-text-full"
                  : "message-text"
              }
            >
              {chat.messages.length === 0
                ? "No messages"
                : `: ${chat.lastMessage && chat.lastMessage.text}`}
              {/* {chat.messages && chat.messages[chat.messages.length - 1]} */}
            </p>
          </span>
        </div>
        <div className="lastMessageCard-section3"> {postDate && postDate}</div>
      </div>
    );
  } else {
    return <h2>LOADING CHATS SCREEN</h2>;
  }
};

export default LastMessageCard;
