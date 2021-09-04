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

import HeaderOption from "./HeaderOption";
import SearchResultsModal from "./SearchResultsModal";
import { signOut } from "firebase/auth";
import {
  colleciton,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveUser,
  setUserLogoutState,
  setSearchActive,
} from "../redux/features/userSlice";

const Header = () => {
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchResuts, setSearchResults] = useState([]);
  const dispatch = useDispatch();
  const navbarSearchRef = useRef();
  const { user, searchActive, loading } = useSelector((state) => state.user);
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
    if (navbarSearchRef.current.contains(e.target)) return;
    console.log("changed active");
    dispatch(setSearchActive(false));
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
          <AiFillLinkedin className="linkedin-icon" />
          <div
            ref={navbarSearchRef}
            className={searchActive ? "header__search full" : "header__search"}
            onClick={() => dispatch(setSearchActive(true))}
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
            <HeaderOption title="Home" Icon={AiFillHome} />
            <HeaderOption title="My Network" Icon={FaUserFriends} />
            <HeaderOption title="Jobs" Icon={FaBriefcase} />
            <HeaderOption title="Notifications" Icon={FaBell} />
            <HeaderOption title="Me" Icon={FaUserCircle} color="lightgray" />
            <span className="header-signout" onClick={handleUserSignOut}>
              <p style={{ margin: "0" }}>Sign out</p>
              <BiLogOut />
            </span>
          </div>
        )}
      </div>
      {searchActive === true && <SearchResultsModal />}
    </>
  );
};

export default Header;
