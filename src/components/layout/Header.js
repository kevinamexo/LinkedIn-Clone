import React, { useState, useEffect, useRef } from "react";
import { AiOutlineSearch, AiFillLinkedin, AiFillHome } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import {
  FaLinkedin,
  FaUserCircle,
  FaUserFriends,
  FaBriefcase,
  FaBell,
} from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import Notification from "../notifications/Notification";
import ConnectionRequests from "../notifications/ConnectionRequests";
import ClipLoader from "react-spinners/ClipLoader";
import "./Header.css";
import { Link } from "react-router-dom";
import HeaderOption from "./HeaderOption";
import SearchResultsModal from "../modals/SearchResultsModal";
import { signOut } from "firebase/auth";
import {
  Timestamp,
  query,
  collection,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveUser,
  setUserLogoutState,
} from "../../redux/features/userSlice";

import {
  setSearchActive,
  setCloseModal,
  setCloseSearchModal,
} from "../../redux/features/modalsSlice";
import {
  setLastNotificationTime,
  setInitialNotificationTime,
  setFilterNotifications,
} from "../../redux/features/notificationsSlice";

import {
  setLastConnectionRequestTime,
  setFilterConnectionRequests,
} from "../../redux/features/connectionRequestsSlice";
import useOutsideClick from "../../customHooks";
import useFetch from "../../firebase/hooks/useFetch";

const Header = () => {
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchResuts, setSearchResults] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(null);
  const [notificationsActive, setNotificationsActive] = useState(false);
  const [connectionRequestsActive, setConnectionRequestsActive] =
    useState(false);
  const [connectionsMenuActive, setConnectionsMenuActive] = useState(false);
  const [loadingSearchResults, setLoadingSearchResults] = useState(null);
  const connectionRequestsMenuRef = useRef();
  const navbarSearchRef = useRef();
  const connectionsIconRef = useRef();
  const notificationsMenuRef = useRef();
  const notificationsMenuRef2 = useRef();
  const notificationsIconRef = useRef();
  const dispatch = useDispatch();
  const { userObj, loading } = useSelector((state) => state.user);
  const {
    connectionRequests,
    newConnectionRequests,
    pastConnectionRequests,
    loadingConnectionRequests,
  } = useSelector((state) => state.connectionRequests);
  const {
    notifications,
    newNotifications,
    prevNewNotifications,
    pastNotifications,
  } = useSelector((state) => state.notifications);
  const { searchActive } = useSelector((state) => state.modals);
  const [data, setData] = useState([]);
  // const [newNotis, setNewNotis] = useState(newNotifications.length>0);
  //Event handlers
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");

  const sendNotificationsClick = async () => {
    const q = query(
      collection(db, "notifications"),
      where("username", "==", userObj.username)
    );
    let followsRefId;
    const qSnap = await getDocs(q);
    qSnap.forEach((doc) => {
      followsRefId = doc.id;
    });
    let date = new Date();
    console.log(date);
    let timestamp = Timestamp.fromDate(date);
    const followsRef = doc(db, "notifications", followsRefId);
    if (notificationsActive === false) {
      await updateDoc(followsRef, {
        lastNotification: timestamp,
      });
    }

    console.log(`Updated last notification time to ${timestamp.toDate()}`);
  };
  const sendConnectionRequestsClick = async () => {
    const q = query(
      collection(db, "connectionRequests"),
      where("username", "==", userObj.username)
    );
    let requestsRefId;
    const qSnap = await getDocs(q);
    qSnap.forEach((doc) => {
      requestsRefId = doc.id;
    });
    let date = new Date();
    console.log(date);
    let timestamp = Timestamp.fromDate(date);
    const followsRef = doc(db, "connectionRequests", requestsRefId);
    if (notificationsActive === false) {
      console.log("opened menu");
      await updateDoc(followsRef, {
        lastConnectionRequest: timestamp,
      });
    }

    console.log(`Updated last notification time to ${timestamp.toDate()}`);
  };
  const handleClickNotification = async () => {
    setLoadingNotifications(true);
    setNotificationsActive(!notificationsActive);
    let state = !notificationsActive;
    let date = new Date();
    console.log(date);
    let timestamp = Timestamp.fromDate(date);
    timestamp = new Date(timestamp.seconds * 1000);
    dispatch(setLastNotificationTime(timestamp));
    if (state === true) {
      console.log("NOTIFICATIONS ACTIVE");
      await sendNotificationsClick();
      // setLoadingNotifications(false);
    } else {
      console.log(false);
      console.log("NOT NOTIFICATIONS ACTIVE");
      dispatch(setFilterNotifications());
    }
    setLoadingNotifications(false);
  };
  const handleClickConnections = async () => {
    console.log("HANDLING");
    console.log(connectionsMenuActive);

    setConnectionsMenuActive(!connectionsMenuActive);
    let state = !connectionsMenuActive;
    let date = new Date();
    console.log(date);
    let timestamp = Timestamp.fromDate(date);
    console.log(timestamp);

    console.log(state);
    dispatch(setLastConnectionRequestTime(timestamp));
    if (state === true) {
      console.log("CONNECTIONS ACTIVE");
      await sendConnectionRequestsClick();
    } else {
      console.log("CONNECTIONS NOT ACTIVE");
      dispatch(setFilterConnectionRequests());
    }
    console.log(connectionsMenuActive);
  };
  const handleHeaderSearchChange = (e) => {
    setHeaderSearch(e.target.value);
  };
  const fetchSearchResults = async () => {
    let date = new Date();
    console.log(date);
    let timestamp = Timestamp.fromDate(date);
    const q = query(collection(db, "users"), where("user"));

    dispatch(setLastNotificationTime(timestamp));
    if (connectionsMenuActive === true) {
      console.log("NOTIFICATIONS ACTIVE");
      dispatch(setFilterNotifications());
    } else {
      console.log(false);
      console.log("NOT NOTIFICATIONS ACTIVE");
      await sendConnectionRequestsClick();
    }
  };
  const handleUserSignOut = async () => {
    signOut(auth)
      .then(() => {
        dispatch(setUserLogoutState());

        history.push("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    console.log(connectionRequestsMenuRef.current);
  }, [connectionRequestsMenuRef.current]);

  useOutsideClick(connectionRequestsMenuRef, connectionsIconRef, (e) => {
    setConnectionsMenuActive(false);
    console.log("CONNECTIONS NOT ACTIVE");
    dispatch(setFilterConnectionRequests());
  });
  useOutsideClick(notificationsMenuRef, notificationsIconRef, (e) => {
    setNotificationsActive(false);
    console.log("CONNECTIONS NOT ACTIVE");
    dispatch(setFilterNotifications());
  });
  useOutsideClick(notificationsMenuRef2, notificationsIconRef, (e) => {
    setNotificationsActive(false);
  });
  const handleSearchActive = (e) => {
    if (navbarSearchRef.current && navbarSearchRef.current.contains(e.target)) {
    } else {
      dispatch(setCloseSearchModal());
    }
  };
  const fetchUser = async (username) => {
    console.log("SEARCHING FOR");
    try {
      setLoadingSearchResults(true);
      const usersQuery = query(
        collection(db, "user"),
        where("username", ">=", username)
      );
      const userSnap = await getDocs(usersQuery);
      let usersArr = [];
      console.log("GETTING THE QUERY SNAPSHOT");
      userSnap.forEach((doc) => {
        console.log(doc.data());
        usersArr.push(doc.data());
      });
      console.log(usersArr);
      setData([...usersArr]);
    } catch (err) {
      console.log(err);
    }
    setLoadingSearchResults(false);
  };

  const handleSearchClick = () => {
    setSearchTerm(headerSearch);
  };

  useEffect(() => {
    console.log(headerSearch);
    if (headerSearch) {
      fetchUser(headerSearch);
    }
  }, [headerSearch]);
  useEffect(() => {
    console.log(headerSearch);
  }, [data]);

  useEffect(() => {
    document.addEventListener("click", handleSearchActive);
    return () => {
      document.removeEventListener("click", handleSearchActive);
    };
  }, []);

  return (
    <>
      <div
        className="header"
        style={loading == false ? { display: "flex" } : { display: "hidden" }}
      >
        <div
          className={
            searchActive ? "header__left-activeSearch" : "header__left"
          }
        >
          <Link to="/">
            <AiFillLinkedin className="linkedin-icon" />
          </Link>
          <div
            ref={navbarSearchRef}
            className={searchActive ? "header__search full" : "header__search"}
            onClick={() => dispatch(setSearchActive())}
          >
            <AiOutlineSearch
              className="header__searchIcon"
              onClick={handleSearchClick}
            />
            <input
              className={
                searchActive ? "header__fullSearchInput" : "header__SearchInput"
              }
              type="text"
              value={headerSearch}
              name="headerSearch"
              placeholder="Search"
              onChange={(e) => setHeaderSearch(e.target.value)}
            />
          </div>
        </div>
        {searchActive !== true && (
          <div className="header__right">
            <HeaderOption
              title="Home"
              Icon={AiFillHome}
              onClick={() => {
                history.push("/");
              }}
            />
            <span
              className="connnectionRequestsSection"
              ref={connectionsIconRef}
            >
              <HeaderOption
                title="My Network"
                Icon={FaUserFriends}
                length={connectionRequests}
                onClick={handleClickConnections}
                type="connectionRequests"
              />
              {connectionsMenuActive === true && (
                <div
                  className="connnectionRequestsMenu-container"
                  ref={connectionRequestsMenuRef}
                >
                  <>
                    <div className="connnectionRequestsMenu">
                      {connectionRequests.length > 0 && (
                        <p className="title">Connection Requests</p>
                      )}

                      {connectionRequests.length === 0 &&
                        newConnectionRequests.length === 0 &&
                        pastConnectionRequests.length === 0 && (
                          <p>No Connection Requests</p>
                        )}
                      {newConnectionRequests &&
                        newConnectionRequests.map((n, idx) => (
                          <ConnectionRequests
                            key={idx}
                            request={n}
                            newConnectionRequest={true}
                            // newNotification={true}
                            type="connectionRequests"
                          />
                        ))}
                      {pastConnectionRequests &&
                        pastConnectionRequests.map((n, idx) => (
                          <ConnectionRequests
                            key={idx}
                            request={n}
                            newItem={false}
                            type="connectionRequests"
                            // newNotification={true}
                          />
                        ))}
                    </div>
                    <div className="notificationsMenu-footer">
                      <Link to="/myNotifications">
                        <button className="notificationsMenu-viewAll">
                          View all Connections
                        </button>
                      </Link>
                    </div>
                  </>
                </div>
              )}
            </span>
            <HeaderOption
              title="Messaging"
              Icon={BsChatDotsFill}
              onClick={() => history.push("/messaging/users/all")}
            />
            <HeaderOption
              title="Jobs"
              Icon={FaBriefcase}
              onClick={() => window.open("https://www.linkedin.com/jobs/")}
            />
            <span
              className="notificationsSection"
              // onClick={handleNotificationsClick}

              ref={notificationsIconRef}
            >
              <HeaderOption
                title="Notifications"
                Icon={FaBell}
                notifications={notifications}
                onClick={handleClickNotification}
                type="notifications"
              />
              {notificationsActive && loadingNotifications === false ? (
                <div
                  className="notificationsMenu-container"
                  ref={notificationsMenuRef}
                >
                  <div
                    className={
                      notifications.length >= 1
                        ? "notificationsMenu"
                        : "notificationsMenu-empty"
                    }
                  >
                    {notifications.length === 0 && <p>No notifications</p>}
                    {prevNewNotifications &&
                      prevNewNotifications.length > 0 &&
                      prevNewNotifications.map((n, idx) => (
                        <Notification
                          key={idx}
                          notification={n}
                          newNotification={true}
                        />
                      ))}
                    {pastNotifications &&
                      pastNotifications.length > 0 &&
                      pastNotifications
                        .slice(0, 5)
                        .map((n, idx) => (
                          <Notification
                            key={idx}
                            notification={n}
                            newNotification={false}
                          />
                        ))}
                  </div>
                  <div className="notificationsMenu-footer">
                    <button
                      onClick={() => {
                        setNotificationsActive(false);
                        history.push("/myNotifications");
                      }}
                      className="notificationsMenu-viewAll"
                    >
                      View all Notifications
                    </button>
                  </div>
                </div>
              ) : notificationsActive && loadingNotifications === true ? (
                <div
                  className="notificationsMenu-container "
                  ref={notificationsMenuRef2}
                >
                  <div className="notificationsMenu-empty">
                    <ClipLoader color={"#0a66c2"} size={20} />
                    <p>LOADING NOTIFICATIONS</p>
                  </div>
                </div>
              ) : null}
            </span>
            {userObj.profilePhotoURL ? (
              <span
                className="header__profilePhoto"
                onClick={() => {
                  history.push(`/in/${userObj.username}`);
                }}
              >
                <img src={userObj.profilePhotoURL} alt={userObj.username} />
                <p style={{ margin: "0" }}>Me</p>
              </span>
            ) : (
              <HeaderOption
                title="Me"
                Icon={FaUserCircle}
                color="lightgray"
                onClick={() => {
                  history.push(`/in/${userObj.username}`);
                }}
              />
            )}
            <span className="header-signout" onClick={handleUserSignOut}>
              <p style={{ margin: "0" }}>Sign out</p>
              <BiLogOut />
            </span>
          </div>
        )}
      </div>
      {searchActive === true ? (
        <SearchResultsModal data={data} loading={loadingSearchResults} />
      ) : null}
    </>
  );
};

export default Header;
