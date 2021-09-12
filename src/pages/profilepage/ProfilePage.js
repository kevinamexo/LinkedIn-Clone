import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ProfilePage.css";

import { setSelectedUser } from "../../redux/features/userSlice";
import { useDispatch, useSelector } from "react-redux";
import LoadingModal from "../../components/LoadingModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { db } from "../../firebase/firebaseConfig";
import ButtonLoader from "../../components/ButtonLoader";
import {
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  orderBy,
  doc,
  limit,
} from "firebase/firestore";

import RSidebar from "../../components/RSidebar";
import { css } from "@emotion/react";
// import "./ButtonLoader.css";
import { ImSpinner2 } from "react-icons/im";
import ClipLoader from "react-spinners/ClipLoader";

const override = css``;

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [profileObj, setProfileObj] = useState({});
  const [profileId, setProfileId] = useState("");
  const [pO, setPO] = useState(false); // flag for makikng sure profileObj is set
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [profId, setProfId] = useState("");
  const [eduInst, setEduInst] = useState("");
  const [organizationData, setOrganizationData] = useState({});
  const [educationData, setEducationData] = useState({});
  const [organizationName, setOrganizationName] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState("");
  const [following, setFollowing] = useState(null);
  const [loadingFollow, setLoadingFollow] = useState(null);

  const dispatch = useDispatch();
  const pageSize = 3;
  const { selectedUser, userObj } = useSelector((state) => state.user);
  const { username } = useParams();

  let profObj = {};
  // let profId = "";
  let currentUser = { ...userObj };

  //FETCH PROFILE DETAILS ON LOAD AND CHECK IF CURRENT USER FOLLOWS THIS USER
  const fetchProfileDetails = async () => {
    setFollowing(true);
    setLoading(true);
    const q = query(collection(db, "user"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    let eduInstitute;
    querySnapshot.forEach((doc) => {
      let o = doc.id;
      setProfId(o);

      profObj = { ...doc.data() };
      setProfileObj(doc.data());
      dispatch(setSelectedUser(doc.data()));
    });
    if (profObj.followers.includes(currentUser.username)) {
    } else {
      setFollowing(false);
    }
    return profObj;
  };
  let orgObj = {};

  const getOrganization = async () => {
    const org_q = query(
      collection(db, "organizations"),
      where("organizationId", "==", profObj.organizationId)
    );
    const org_querySnapshot = await getDocs(org_q);
    org_querySnapshot.forEach((doc) => {
      orgObj = { ...doc.data() };
      setOrganizationData(doc.data());
    });
  };

  let eduObj = {};
  const getEducation = async () => {
    const org_q = query(
      collection(db, "organizations"),
      where("organizationId", "==", profObj.eduInstitutes[0])
    );
    const org_querySnapshot = await getDocs(org_q);
    org_querySnapshot.forEach((doc) => {
      setEducationData(doc.data());
      eduObj = { ...doc.data() };
    });
  };

  const fetchProfileData = async () => {
    await fetchProfileDetails().then(() => {
      getOrganization();
      getEducation();
      setLoading(false);
    });
  };
  let followDocId;
  let userDocId;
  const followUser2 = async () => {
    setLoadingFollow(true);
    try {
      console.log(profId);
      const followsDocRef = query(
        collection(db, "follows"),
        where("username", "==", profileObj.username)
      );
      const followsDocSnap = await getDocs(followsDocRef);
      followsDocSnap.forEach((doc) => {
        followDocId = doc.id;
      });

      console.log(followDocId);
      const followDoc = doc(db, "follows", followDocId);
      await updateDoc(followDoc, {
        users: arrayUnion(userObj.username),
      });

      const userDoc = doc(db, "user", profId);
      await updateDoc(userDoc, {
        followers: arrayUnion(userObj.username),
      });

      setFollowing(true);
    } catch (e) {
      console.log(e);
    }
    setLoadingFollow(false);
  };

  const unFollowUser = async () => {
    setLoadingFollow(true);
    try {
      const followsDocRef = query(
        collection(db, "follows"),
        where("username", "==", profileObj.username)
      );
      const followsDocSnap = await getDocs(followsDocRef);
      followsDocSnap.forEach((doc) => {
        followDocId = doc.id;
      });

      console.log(followDocId);
      const followDoc = doc(db, "follows", followDocId);
      await updateDoc(followDoc, {
        users: arrayRemove(userObj.username),
      });

      const userDoc = doc(db, "user", profId);
      await updateDoc(userDoc, {
        followers: arrayRemove(userObj.username),
      });
      setFollowing(false);
    } catch (e) {
      console.log(e);
    }
    setLoadingFollow(false);
  };

  useEffect(() => {
    fetchProfileData();

    return () => {
      setLoading(true);
    };
  }, []);

  useEffect(() => {
    console.log("following");
    console.log(following);
  }, [following]);

  if (loading === false) {
    return (
      <div className="profilePage">
        <div className="profilePage__main">
          <div className="profilePage__header">
            <div className="profilePage__coverPhoto">
              {profileObj.coverPhotoURL && (
                <img src={profileObj.coverPhotoURL || ""} alt="" />
              )}
            </div>
            <div className="profilePage__details">
              <div className="profilePage__details1">
                <p className="profileName">
                  {profileObj.name.firstName} {profileObj.name.lastName}
                </p>
                <p className="profilePosition">
                  {" "}
                  {profileObj.title}{" "}
                  {organizationData && `at ${organizationData.name}`}
                </p>
                <div className="profileLocation-contactInfo">
                  {profileObj.location && (
                    <p className="profileLocation">{profileObj.location}</p>
                  )}
                  <p className="profileLocation-contactInfo-contact">
                    Contact Info
                  </p>
                </div>
              </div>
              <div className="profilePage__details2">
                <span className="profilePage__details2-organization">
                  <div>
                    <img
                      src={organizationData.organizationLogo}
                      alt={organizationData.name}
                    />
                  </div>
                  <p>{organizationData.name}</p>
                </span>
                {educationData.name && (
                  <span className="profilePage__details2-organization">
                    <div>
                      <img
                        src={educationData.organizationLogo}
                        alt={educationData.name}
                      />
                    </div>
                    <p>{educationData.name}</p>
                  </span>
                )}
              </div>
            </div>
            {/* <span>
            <p className="profileSummary">{profileObj.summary}</p>
            <p className="profileFollowers">229</p>
            profileUsername,profileId, currUserName
            <p className="profileConnections">234</p>
          </span> */}
            <section className="profilePage__details3">
              <p className="profilePage__details3-Connections">
                {profileObj.connections} connections
              </p>
              <span className="profilePage__details3-buttons">
                {!following && (
                  <button className="follow" onClick={() => followUser2()}>
                    {loadingFollow ? (
                      <ImSpinner2 className="loadingSpinner" />
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
                {following && (
                  <button className="follow" onClick={() => unFollowUser()}>
                    {loadingFollow ? (
                      <ImSpinner2 className="loadingSpinner" />
                    ) : (
                      "Following"
                    )}
                  </button>
                )}

                {following ? (
                  <button className="message">More</button>
                ) : (
                  <button className="message">Message</button>
                )}
              </span>
            </section>
            <div className="profilePage__header-profilePic">
              <img
                src={
                  profileObj.profilePic ||
                  "https://w7.pngwing.com/pngs/841/727/png-transparent-computer-icons-user-profile-synonyms-and-antonyms-android-android-computer-wallpaper-monochrome-sphere.png"
                }
                alt="profile-picture"
              />
            </div>
          </div>
          <div className="profilePage__About">
            <p className="title">About</p>
            <p
              className={!showFullSummary ? "about" : "about-full"}
              onClick={() => setShowFullSummary(!showFullSummary)}
            >
              {profileObj.summary}
            </p>
            <p
              className="seeMore"
              onClick={() => setShowFullSummary(!showFullSummary)}
            >
              {showFullSummary ? "show less.." : "see more..."}
            </p>
          </div>
          <div className="profilePage__featured">
            <p>Posts</p>
          </div>
        </div>
        <RSidebar className="profilePage__RSidebar" />
      </div>
    );
  } else {
    return (
      <div className="profilePage">
        <LoadingSpinner loading={true} />
      </div>
    );
  }
};

export default ProfilePage;
