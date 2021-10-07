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
const Header = () => {
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchResuts, setSearchResults] = useState([]);
  const [notificationsActive, setNotificationsActive] = useState(false);
  const dispatch = useDispatch();
  const navbarSearchRef = useRef();
  const { user, userObj, loading } = useSelector((state) => state.user);
  const { notifications, lastNotification } = useSelector(
    (state) => state.notifications
  );
  const { searchActive } = useSelector((state) => state.modals);

  //Event handlers
  const history = useHistory();

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

  useEffect(() => {
    console.log(searchActive);
  }, [searchActive]);
  useEffect(() => {
    console.log("NEW LAST NOTIFICATION TIME IS");
    console.log(lastNotification);
  }, [lastNotification]);

  const handleNotificationsClick = async () => {
    setNotificationsActive(!notificationsActive);
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
            <HeaderOption title="My Network" Icon={FaUserFriends} />
            <HeaderOption
              title="Jobs"
              Icon={FaBriefcase}
              onClick={() => window.open("https://www.linkedin.com/jobs/")}
            />
            <span
              className="notificationsSection"
              onClick={handleNotificationsClick}
            >
              <HeaderOption
                title="Notifications"
                Icon={FaBell}
                notifications={notifications}
              />
              {notificationsActive && (
                <div className="notificationsMenu">
                  {notifications.length === 0 && (
                    <p>No notifications available</p>
                  )}
                  {notifications &&
                    notifications.length > 0 &&
                    notifications.map((n, idx) => (
                      <Notification key={idx} notification={n} />
                    ))}
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
