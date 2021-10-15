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
import Notification from "../notifications/Notification";
import ConnectionRequests from "../notifications/ConnectionRequests";

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

const Header = () => {
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchResuts, setSearchResults] = useState([]);

  const [notificationsActive, setNotificationsActive] = useState(false);
  const [connectionRequestsActive, setConnectionRequestsActive] =
    useState(false);

  const dispatch = useDispatch();
  const navbarSearchRef = useRef();
  const { user, userObj, loading } = useSelector((state) => state.user);
  const { connectionRequests } = useSelector(
    (state) => state.connectionRequests
  );
  const {
    notifications,

    newNotifications,
    pastNotifications,
  } = useSelector((state) => state.notifications);
  const { searchActive } = useSelector((state) => state.modals);

  // const [newNotis, setNewNotis] = useState(newNotifications.length>0);
  //Event handlers
  const history = useHistory();

  const sendNotificationsClick = async () => {
    const q = query(
      collection(db, "follows"),
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
    const followsRef = doc(db, "follows", followsRefId);
    if (notificationsActive === false) {
      await updateDoc(followsRef, {
        lastNotification: timestamp,
      });
    }

    console.log(`Updated last notification time to ${timestamp.toDate()}`);
  };
  const handleClickNotification = async () => {
    setNotificationsActive(!notificationsActive);
    let date = new Date();
    console.log(date);
    let timestamp = Timestamp.fromDate(date);
    timestamp = new Date(timestamp.seconds * 1000);
    dispatch(setLastNotificationTime(timestamp));
    if (notificationsActive === true) {
      console.log("NOTIFICATIONS ACTIVE");
      dispatch(setFilterNotifications());
    } else {
      console.log(false);
      console.log("NOT NOTIFICATIONS ACTIVE");
      await sendNotificationsClick();
    }
  };
  const handleHeaderSearchChange = (e) => {
    setHeaderSearch(e.target.value);
  };
  const fetchSearchResults = async () => {
    const q = query(collection(db, "users"), where("user"));
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

  const handleSearchActive = (e) => {
    if (navbarSearchRef.current && navbarSearchRef.current.contains(e.target)) {
    } else {
      dispatch(setCloseSearchModal());
    }
  };

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
            <AiOutlineSearch className="header__searchIcon" />
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
            <span className="connnectionRequestsSection">
              <HeaderOption
                title="My Network"
                Icon={FaUserFriends}
                length={connectionRequests}
                onClick={() =>
                  setConnectionRequestsActive(!connectionRequestsActive)
                }
              />
              {connectionRequestsActive && (
                <div className="connnectionRequestsMenu-container">
                  <div className="connnectionRequestsMenu">
                    {connectionRequests.length === 0 && (
                      <p>No notifications available</p>
                    )}
                    {connectionRequests &&
                      connectionRequests.map((n, idx) => (
                        <ConnectionRequests
                          key={idx}
                          request={n}
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
                </div>
              )}
            </span>
            <HeaderOption
              title="Jobs"
              Icon={FaBriefcase}
              onClick={() => window.open("https://www.linkedin.com/jobs/")}
            />
            <span
              className="notificationsSection"
              // onClick={handleNotificationsClick}
            >
              <HeaderOption
                title="Notifications"
                Icon={FaBell}
                notifications={notifications}
                onClick={handleClickNotification}
              />
              {notificationsActive && (
                <div className="notificationsMenu-container">
                  <div className="notificationsMenu">
                    {notifications.length === 0 && (
                      <p>No notifications available</p>
                    )}
                    {newNotifications &&
                      newNotifications.length > 0 &&
                      newNotifications.map((n, idx) => (
                        <Notification
                          key={idx}
                          notification={n}
                          newNotification={true}
                        />
                      ))}
                    {pastNotifications &&
                      pastNotifications.length > 0 &&
                      pastNotifications.map((n, idx) => (
                        <Notification
                          key={idx}
                          notification={n}
                          newNotification={false}
                        />
                      ))}
                  </div>
                  <div className="notificationsMenu-footer">
                    <Link to="/myNotifications">
                      <button className="notificationsMenu-viewAll">
                        View all Notifications
                      </button>
                    </Link>
                  </div>
                </div>
              )}
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
      {searchActive === true ? <SearchResultsModal /> : null}
    </>
  );
};

export default Header;
