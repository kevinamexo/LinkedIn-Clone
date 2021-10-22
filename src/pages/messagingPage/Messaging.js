import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import _ from "lodash";
import {
  query,
  where,
  doc,
  collection,
  getDocs,
  addDoc,
  orderBy,
  limit,
  arrayUnion,
  updateDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./MessagesPage.css";
import { useParams, Route, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setMessages,
  setCurrentChatUser,
  setChatRoomId,
  setInitialMessageFetch,
  setResetChats,
  setAddToUserChats,
  setUserChats,
  setChatIdsSet,
  setUpdateChat,
  setUserFullNames,
  setChatRoomSnapshot,
  setGroupedMessages,
} from "../../redux/features/chatsSlice";

import LastMessageCard from "../../components/messages/LastMessageCard";

const Messaging = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { userObj, fullName } = useSelector((state) => state.user);
  const {
    currentChatUser,
    chatRoomId,
    messages,
    userChats,
    initialMessageFetch,
    groupedMessages,
  } = useSelector((state) => state.chats);
  // const [previousMessageAuthor, setPreviousMessage] = useState(null);
  const [messageUserName, setMessageUserName] = useState("");
  const messageEl = useRef(null);
  const [messageText, setMessageText] = useState("");
  const messagesContainerRef = useRef(null);
  const [otherUserObj, setOtherUserObj] = useState({});
  const [chatRoomExisted, setChatRoomExisted] = useState(null);
  const [fetchedAllChatRooms, setFetchedAllChatRooms] = useState(null);
  const [showCurrentMessages, setShowCurrentMessages] = useState(null);

  const history = useHistory();

  // CHECK WHETHER A CHAR WITH THE USER ALREADY EXISTS
  const fetchUserChatRoom = async () => {
    let chatName;
    if (userObj && username) {
      chatName = [username, userObj.username].sort().join("");
      console.log("USER CHAT NAME IS" + chatName);
    }
    const userChatQuery = query(
      collection(db, "chats"),
      where("chatName", "==", chatName)
    );

    const userChatSnap = await getDocs(userChatQuery);
    userChatSnap.forEach((doc) => {
      console.log("CHECKING IF USER CHAT EXISTS");
      if (doc.data().chatName === chatName) {
        console.log("CHAT ROOM EXISTS");
        setChatRoomExisted(true);
      } else {
        console.log("CHAT ROOM DOES NOT EXIST");
        setChatRoomExisted(false);

        console.log("CREATED NEW CHAT ROOM");
      }
    });
  };

  const fetchAllChats = async () => {
    const allChatsQuery = query(
      collection(db, "chats"),
      where("users", "array-contains", userObj.username)
    );
    const allChatsListener = onSnapshot(allChatsQuery, (querySnapshot) => {
      let tmpChats = [];
      let tmpChats2 = [];
      let userNames = [];
      let userFullNames = [];
      if (initialMessageFetch === null) {
        querySnapshot.forEach((doc) => {
          ///COMPARE THE CURRRENT CHAT RROM TO THE SNAPSHOT CHAT ROOMS
          if (doc.data().chatName) {
            tmpChats.push({ ...doc.data(), id: doc.id });
            tmpChats.forEach((chat) => {
              tmpChats2.push({
                ...chat,
                lastMessage: {
                  ...chat.lastMessage,
                  published: new Date(
                    chat.lastMessage.published.seconds * 1000
                  ),
                },
              });
            });
            doc.data().users.forEach((user_name) => {
              let y = userNames.some((x) => x === user_name);
              console.log(y);
              if (y === false) {
                userNames.push(user_name);
              }
            });
          }
        });

        console.log(userNames);

        userNames.forEach(async (x) => {
          const userNameQuery = query(
            collection(db, "user"),
            where("username", "==", x)
          );
          const userNameSnap = await getDocs(userNameQuery);
          userNameSnap.forEach((doc) => {
            console.log(doc.data());
            userFullNames.push({
              username: doc.data().username,
              name: doc.data().name,
              profilePhotoURL: doc.data().profilePhotoURL,
            });
          });
          let userFullNamesArr = [...userFullNames];
          console.log(userFullNamesArr);
          dispatch(setUserFullNames([...userFullNamesArr]));
        });
        console.log("USERNAMES");
        console.log(userNames);
        console.log("USER FULL NAMES");
        console.log(tmpChats);

        dispatch(setUserChats([tmpChats2]));

        // dispatch(setUserIds());ss
      } else if (initialMessageFetch === true) {
        querySnapshot.forEach((doc) => {
          dispatch(setChatRoomSnapshot(doc.data()));
          ///fetch userName if not in data store
        });
      }
    });
    setFetchedAllChatRooms(true);
  };

  const createNewChat = async () => {
    console.log("creating new chat room");
    const date = new Date();
    console.log(date);
    const timestamp = Timestamp.fromDate(date);
    await addDoc(collection(db, "chats"), {
      chatName: [username, userObj.username].sort().join(""),
      users: [userObj.username, username],
      lastMessage: { published: timestamp },
      messages: [],
    }).then((docRef) => {
      const chatName = [username, userObj.username].sort().join("");
      console.log(docRef.id);
      dispatch(setChatRoomId([docRef.id, chatName]));
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const convertDateWords = (string) => {
    const date = new Date(Date.parse(string));
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (isToday(date)) {
      return "TODAY";
    } else {
      return date.toLocaleDateString("en-GB", options);
    }
  };

  const sortMesssagesByDate = () => {
    console.log(messages);
    const messagesWithFormattedDate = [];
    messages.forEach((msg) => {
      messagesWithFormattedDate.push({
        ...msg,
        time: msg.published,
        published: new Date(msg.published.seconds * 1000).toLocaleDateString(
          "en-US"
        ),
      });
    });

    console.log(messagesWithFormattedDate);
    console.log("messagesWithFormattedDate");

    if (messagesWithFormattedDate.length > 0) {
      const result = messagesWithFormattedDate.reduce((message, index) => {
        message[index.published] = message[index.published] || [];
        message[index.published].push(index);
        return message;
      }, Object.create(null));
      console.log(result);

      const keys = Object.keys(result);
      const values = Object.values(result);

      const groupedMessagesArr = [];

      for (let i = 0; i < keys.length; i++) {
        groupedMessagesArr.push({
          [keys[i]]: values[i],
        });
      }
      console.log(groupedMessagesArr);

      groupedMessagesArr.forEach((arr) => {
        console.log(Object.keys(arr));
        console.log(Object.values(arr));
        const messages = Object.values(arr);
      });
      console.log(groupedMessagesArr);

      dispatch(setGroupedMessages(groupedMessagesArr));
    }
  };
  useEffect(() => {
    console.log("MESSAGES");
    if (messages.length > 0) {
      sortMesssagesByDate();
    } else {
      dispatch(setGroupedMessages([]));
    }
  }, [messages]);
  /// SET CURRENT CHAT USER NAME ON LOAD FROM URL
  useEffect(() => {
    const checkUserExists = async () => {
      let userExists = null;
      const usernameQuery = query(
        collection(db, "user"),
        where("username", "==", username)
      );
      const userSnap = await getDocs(usernameQuery);
      let userArr = [];
      userSnap.forEach((doc) => {
        if (doc.data().username === username) {
          console.log(username + "DOES EXIST");
          userArr.push(doc.data());

          return dispatch(setCurrentChatUser(username));
        }
      });

      if (userArr.length === 0) {
        history.push("/");
      }
    };
    if (userObj) {
      checkUserExists();
    }
  }, [userObj]);
  //FETCH ALL CHATS
  useEffect(() => {
    fetchAllChats();

    return () => {
      fetchAllChats();
      dispatch(setResetChats());
    };
  }, [userObj]);

  ///CHECK IF THE CHAT EXISTS
  useEffect(() => {
    const checkChatExists = async () => {
      const tempChatName = [currentChatUser, userObj.username].sort().join("");
      const userChatQuery = query(
        collection(db, "chats"),
        where("chatName", "==", tempChatName)
      );

      const userChatSnap = await getDocs(userChatQuery);
      let chatArr = [];
      userChatSnap.forEach((doc) => {
        if (doc.data().chatName) {
          console.log(doc.data().chatName);
          chatArr.push(doc.data().chatName);
          dispatch(setChatRoomId([doc.id, tempChatName]));
        }
      });
      console.log(chatArr.length);
      if (chatArr.length === 0) {
        console.log("CHAT DOES NOT EXIST");
        await createNewChat();
      }
    };
    if (userObj && currentChatUser === userObj.username) {
      console.log("YOU CANNOT CREATE A CHATROOM WITH YOURSELF");
      history.push("/");
    } else if (
      userObj &&
      currentChatUser &&
      currentChatUser !== userObj.username
    ) {
      console.log("checking whether chat exists...");
      checkChatExists();
    }
  }, [currentChatUser]);

  //GET CHAT USERS NAMES
  useEffect(() => {
    const fetchCurrentChatUser = async () => {
      let userExists;
      const userQuery = query(
        collection(db, "user"),
        where("username", "==", currentChatUser)
      );
      const getUser = await getDocs(userQuery);
      getUser.forEach((doc) => {
        if (doc.data().username === currentChatUser) {
          let chatUserName = `${doc.data().name.firstName} ${
            doc.data().name.lastName || null
          }`;
          setOtherUserObj(doc.data());
          setMessageUserName(chatUserName);
        }
      });
    };
    if (currentChatUser) {
      fetchCurrentChatUser();
    }
  }, [userObj, currentChatUser]);

  ///CHAT MESSAGES LISTENER
  useEffect(() => {
    if (currentChatUser) {
      const tempChatName = [currentChatUser, userObj.username].sort().join("");
      const userChatQuery = query(
        collection(db, "chats"),
        where("chatName", "==", tempChatName)
      );
      const userChatSnap = onSnapshot(userChatQuery, (querySnapshot) => {
        let chatArr = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().chatName) {
            chatArr.push(doc.data());
          }
        });
        if (chatArr.length === 1) {
          console.log("alreadyExists");
          querySnapshot.docChanges().forEach((change) => {
            let t = change.type;
            console.log(change.type);
            console.log("CHANGE DOC DATA");
            console.log(change.doc.data());
            if (change.type === "added" || change.type === "modified") {
              console.log(change.doc.data());
              console.log(change.doc.data().messages);
              dispatch(setMessages(change.doc.data().messages));
            }
          });
        }
        const tempChatName = [currentChatUser, userObj.username]
          .sort()
          .join("");
      });
    }
  }, [currentChatUser]);

  ///SORT MESSAGES BY DATE

  useEffect(() => {
    if (messageEl && messageEl.current) {
      messageEl.current.addEventListener("DOMNodeInserted", (event) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messageEl.current]);

  const handleWindowWResize = () => {
    if (window.innerWidth <= 630) {
      setShowCurrentMessages(false);
      console.log("LESS THAN 630");
    } else {
      setShowCurrentMessages(true);
      console.log("MORE THAN 630");
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowWResize);

    return () => {
      window.removeEventListener("resize", handleWindowWResize);
    };
  }, []);

  const createNewChatRoom = async () => {
    await createNewChat();
    setChatRoomExisted(true);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (messageText) {
      let date = new Date();
      console.log(date);
      let timestamp = Timestamp.fromDate(date);
      let tmpMessage = messageText;
      setMessageText("");
      const messageObj = {
        postType: "text",
        text: tmpMessage,
        published: timestamp,
        authorId: userObj.username,
      };
      const messageDocRef = doc(db, "chats", chatRoomId);
      await updateDoc(messageDocRef, {
        messages: arrayUnion(messageObj),
        lastMessage: messageObj,
      });
    }
  };

  function calculateTimeFromTimestamp(timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + "" + ampm;
    return strTime;
  }

  function getMessageTime(dateString) {
    const date = new Date(Date.parse(dateString));
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + "" + ampm;

    return strTime;
  }
  if (userObj && messageUserName) {
    return (
      <div className="messagesPage">
        <div className="messagesPageContainer">
          <div
            className={
              !currentChatUser && showCurrentMessages === true
                ? "hide-otherChats"
                : "messagesPage__otherChats"
            }
          >
            <div className="allChats-header">Messaging</div>
            {userChats &&
              userChats.map((chat) => <LastMessageCard chat={chat} />)}
          </div>
          {currentChatUser ? (
            <div className="messagesPage__currentMessages">
              <span className="currentMessages-header">
                <IoChevronBackOutline
                  className="back"
                  onClick={() => dispatch(setCurrentChatUser(null))}
                />
                {messageUserName && (
                  <div>
                    <p
                      className="messageUser-name"
                      onClick={() => history.push(`/in/${currentChatUser}`)}
                    >
                      {messageUserName}
                    </p>
                    <p className="messageUser-title">
                      {otherUserObj && otherUserObj.title
                        ? otherUserObj.title
                        : "Connection"}
                      {/* {currentChatUser&&!currentChatUser.title&& 'Connection'} */}
                    </p>
                  </div>
                )}
              </span>
              {currentChatUser ? (
                <div className="currentMessage__messages" ref={messageEl}>
                  <header className="currentChatUser-summary">
                    {otherUserObj.profilePhotoURL ? (
                      <img
                        src={otherUserObj.profilePhotoURL}
                        className="currentChatUser-summary-photo"
                      />
                    ) : (
                      <FaUserCircle className="currentChatUser-summary-photo" />
                    )}
                    <p
                      className="currentChatUser-summary-name"
                      onClick={() => history.push(`/in/${currentChatUser}`)}
                    >
                      {messageUserName}
                    </p>
                    <p className="currentChatUser-summary-title">
                      {otherUserObj && otherUserObj.title
                        ? otherUserObj.title
                        : "Connection"}
                    </p>
                  </header>
                  {groupedMessages && groupedMessages.length === 0 && (
                    <p className="no_messages">No Messages</p>
                  )}
                  {groupedMessages &&
                    groupedMessages.map((mesg) => (
                      <>
                        {
                          <p className="date-label">
                            <span>{convertDateWords(Object.keys(mesg))}</span>
                          </p>
                        }
                        {Object.values(mesg)[0].map((msg) => (
                          <div
                            className={
                              msg.authorId === userObj.username
                                ? "my-message"
                                : "user-message"
                            }
                          >
                            <section className="msgSection1">
                              {msg.authorId === userObj.username &&
                              userObj.profilePhotoURL !== null &&
                              userObj.profilePhotoURL !== "" ? (
                                <img
                                  src={userObj.profilePhotoURL}
                                  className="messages-user-photo"
                                />
                              ) : userObj &&
                                userObj.username &&
                                msg.authorId === userObj.username &&
                                userObj.profilePhotoURL === null ? (
                                <FaUserCircle className="messages-user-photo-noPhoto" />
                              ) : null}
                              {currentChatUser !== null &&
                              currentChatUser.username !== null &&
                              msg.authorId === currentChatUser.username &&
                              currentChatUser.profilePhotoURL !== null ? (
                                <img
                                  src={currentChatUser.profilePhotoURL}
                                  className="messages-user-photo"
                                />
                              ) : msg.authorId === currentChatUser.username &&
                                currentChatUser.profilePhotoUrl === null ? (
                                <FaUserCircle className="messages-user-photo-noPhoto" />
                              ) : null}
                            </section>
                            <section className="msgSection2">
                              <span className="messageHeader">
                                <p
                                  className="messageAuthorName"
                                  onClick={() => {
                                    if (
                                      msg.authorId === currentChatUser.username
                                    ) {
                                      history.push(
                                        `/in/${currentChatUser.username}`
                                      );
                                    }
                                  }}
                                >
                                  {msg.authorId === userObj.username
                                    ? fullName
                                    : messageUserName}
                                </p>
                                <p className="messageTime">
                                  {calculateTimeFromTimestamp(msg.time)}
                                </p>
                              </span>
                              <p className="messageItem">{msg.text}</p>
                            </section>
                          </div>
                        ))}
                      </>
                    ))}
                </div>
              ) : (
                <div className="currentMessages-noUser">
                  <p>Select a chat </p>
                </div>
              )}
              <form className="messageInput-section" onSubmit={sendMessage}>
                <input
                  className="messageInput"
                  name="messageText"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write a message..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
          ) : (
            <div className="currentMessages-noUser">Select a chat</div>
          )}
        </div>
      </div>
    );
  } else {
    return <div>LOADING DATA</div>;
  }
};

export default Messaging;
