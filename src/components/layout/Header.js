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

import "./Header.css";
import { Link } from "react-router-dom";
import HeaderOption from "./HeaderOption";
import SearchResultsModal from "../modals/SearchResultsModal";
import { signOut } from "firebase/auth";
import {
  colleciton,
  query,
  collection,
  where,
  getDocs,
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
  const dispatch = useDispatch();
  const navbarSearchRef = useRef();
  const { user, userObj, loading } = useSelector((state) => state.user);

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
        console.log(user);
        history.push("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSearchActive = (e) => {
    if (navbarSearchRef.current && navbarSearchRef.current.contains(e.target)) {
      console.log("Contains Ref");
    } else {
      dispatch(setCloseSearchModal());
      console.log("Does not contain ref");
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
            <HeaderOption title="Notifications" Icon={FaBell} />
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
