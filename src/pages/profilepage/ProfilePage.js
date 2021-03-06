import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import "./ProfilePage.css";

import { setSelectedUser } from "../../redux/features/userSlice";
import {
  setShowContactCardModal,
  setShowEditSummaryModal,
} from "../../redux/features/modalsSlice";
import { useDispatch, useSelector } from "react-redux";

import LoadingModal from "../../components/modals/LoadingModal";
import LoadingSpinner from "../../components/loaders/LoadingSpinner";
import { db } from "../../firebase/firebaseConfig";
import ButtonLoader from "../../components/loaders/ButtonLoader";
import {
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  orderBy,
  Timestamp,
  doc,
  limit,
} from "firebase/firestore";

import RSidebar from "../../components/layout/RSidebar";
import { css } from "@emotion/react";
// import "./ButtonLoader.css";
import { ImSpinner2 } from "react-icons/im";
import { BiEditAlt } from "react-icons/bi";
import { RiPencilLine } from "react-icons/ri";
import ClipLoader from "react-spinners/ClipLoader";
import FeedPost from "../../components/FeedPost";
import ContactInfoModal from "../../components/modals/ContactInfoModal";
import EditSummaryModal from "../../components/modals/EditSummaryModal";
const override = css``;

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [myProfile, setMyProfile] = useState(null);
  const [profileObj, setProfileObj] = useState({});
  const [profileId, setProfileId] = useState("");
  const [pO, setPO] = useState(false); // flag for makikng sure profileObj is set
  const [summary, setSummary] = useState(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [profId, setProfId] = useState("");
  const [eduInst, setEduInst] = useState("");
  const [organizationData, setOrganizationData] = useState({});
  const [educationData, setEducationData] = useState({});
  const [organizationName, setOrganizationName] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState("");
  const [profilePosts, setProfilePosts] = useState([]);
  const [following, setFollowing] = useState(null);
  const [loadingFollow, setLoadingFollow] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(null);
  const [pendingConnectionRequest, setPendingConnectionRequest] =
    useState(null);
  const dispatch = useDispatch();
  const [userConnections, setUserConnections] = useState(null);

  const pageSize = 3;
  const { selectedUser, userObj } = useSelector((state) => state.user);
  const { showContactCardModal, showEditSummaryModal } = useSelector(
    (state) => state.modals
  );
  const { username } = useParams();

  let profObj = {};
  // let profId = "";
  let currentUser = { ...userObj };

  //FETCH PROFILE DETAILS ON LOAD AND CHECK IF CURRENT USER FOLLOWS THIS USER
  const fetchProfileDetails = async () => {
    setLoading(true);
    const q = query(collection(db, "user"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    let eduInstitute;
    querySnapshot.forEach((doc) => {
      console.log(username);
      let o = doc.id;
      setProfId(o);
      profObj = { ...doc.data() };
      setProfileObj(doc.data());
      dispatch(setSelectedUser(doc.data()));
    });
    const connectionRequestsQuery = query(
      collection(db, "connectionRequests"),
      where("username", "==", username)
    );
    const connectionRequestsSnap = onSnapshot(
      connectionRequestsQuery,
      (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (
            change.type !== "removed" &&
            change.doc.data().connectionRequests &&
            change.doc
              .data()
              .connectionRequests.some((r) => r.username === userObj.username)
          ) {
            console.log("PENDING CONNECTION REQUESR");
            setPendingConnectionRequest(true);
          } else {
            setPendingConnectionRequest(false);
          }
        });
      }
    );
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
      if (profObj.organizationId) {
        getOrganization();
      }
      if (profObj.eduInstitutes) {
        getEducation();
      }
    });
  };
  let followDocId;
  let userDocId;
  const followUser2 = async () => {
    setLoadingFollow(true);
    try {
      setFollowing(true);
      let date = new Date();
      console.log(date);
      let timestamp = Timestamp.fromDate(date);
      console.log(profId);
      const followsDocRef = query(
        collection(db, "connectionRequests"),
        where("username", "==", profileObj.username)
      );
      const followsDocSnap = await getDocs(followsDocRef);
      followsDocSnap.forEach((doc) => {
        followDocId = doc.id;
      });

      console.log(followDocId);
      const followDocRef = doc(db, "connectionRequests", followDocId);
      await updateDoc(followDocRef, {
        connectionRequests: arrayUnion({
          username: userObj.username,
          published: timestamp,
        }),
      });
    } catch (e) {
      console.log(e);
    }
    setLoadingFollow(false);
  };

  const fetchFollows = () => {
    const q2 = query(
      collection(db, "follows"),
      where("username", "==", profileObj.username)
    );
    console.log(profileObj.username);
    const followsListenter = onSnapshot(q2, (querySnapshot) => {
      let following;
      querySnapshot.forEach((doc) => {
        if (
          doc.data() &&
          doc.data().users.some((r) => r === userObj.username)
        ) {
          setFollowing(true);
          following = true;
        } else {
          setFollowing(false);
          following = false;
        }
        console.log("FOLLOWING USER" + following);
        // if (doc.data().users.includes(userObj.username)) {
        //   setFollowing(true);
        //   console.log("You are connected with " + profileObj.username);
        // } else {
        //   setFollowing(false);
        // }
        setUserConnections(doc.data().users.length);
      });
    });
    setLoading(false);
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
      setLoadingFollow(false);
      setFollowing(false);
    } catch (e) {
      console.log(e);
    }
  };
  const fetchPosts = async () => {
    if (profileObj.username) {
      let latestPosts = [];
      try {
        setLoadingPosts(true);
        const followedUsers = query(
          collection(db, "follows"),
          where("username", "==", profileObj.username),
          orderBy("lastPost", "desc"),
          limit(10)
        );
        const posts = await getDocs(followedUsers);
        posts.forEach((doc) => {
          if (doc.data().recentPosts.length > 0) {
            console.log(doc.data());

            latestPosts = [...latestPosts, ...doc.data().recentPosts];
          } else {
            latestPosts = [];
          }
        });
        setProfilePosts(latestPosts);
        setLoadingPosts(false);
      } catch (e) {
        console.log(e);
      }
    }
  };
  useEffect(() => {
    console.log("FETCHING PROFILE USER");
    fetchProfileData();
    return () => {
      setOrganizationData({});
      setFollowing(null);
      setProfileObj({});
      dispatch(setSelectedUser(null));
    };
  }, [username]);

  useEffect(() => {
    fetchPosts();
  }, [!loading]);

  useEffect(() => {
    console.log("profilePosts");
    console.log(profilePosts);
  }, [profilePosts]);

  useEffect(() => {
    if (profileObj) {
      console.log("PROFILE OBJECT IS");
      console.log(profileObj);
      console.log("selectedUser");
      console.log(selectedUser);
      console.log("userObj");
      console.log(userObj);
      if (profileObj.username === userObj.username) {
        setMyProfile(true);
      } else {
        console.log("not my profile");
        setMyProfile(false);
      }
    }

    return () => {
      setMyProfile(null);
    };
  }, [profileObj]);

  useEffect(() => {
    console.log(profileObj.username);
    console.log(pendingConnectionRequest);
    if (profileObj.username && pendingConnectionRequest !== null) {
      fetchFollows();
    }
    if (myProfile === true) {
      setSummary(userObj.summary);
    } else {
      setSummary(profileObj.summary);
      // fetchFollows(profileObj.username);
    }
  }, [profileObj, pendingConnectionRequest]);
  const fullName =
    userObj.name &&
    `${
      userObj.name.firstName.charAt(0).toUpperCase() +
      userObj.name.firstName.slice(1)
    } ${
      userObj.name.lastName.charAt(0).toUpperCase() +
      userObj.name.lastName.slice(1)
    }`;
  const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  const fetchPageViews = async () => {
    console.log("FETCHING PAGE VIEWS");
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("username", "==", profileObj.username)
    );
    const pageViewsSnap = await getDocs(notificationsQuery);

    pageViewsSnap.forEach(async (document) => {
      const profileNotificationsDocRef = doc(db, "notifications", document.id);
      let date = new Date();
      console.log(date);
      let timestamp = Timestamp.fromDate(date);
      if (document.data() && document.data().pageViews) {
        const pageViews = document.data().pageViews;
        const userPageViews =
          document.data() &&
          document
            .data()
            .pageViews.some((v) => v.username === userObj.username);
        if (userPageViews) {
          const mySortedPageViews = document.data().pageViews.sort((a, b) => {
            return (
              new Date(b.published.seconds * 1000) -
              new Date(a.published.seconds * 1000)
            );
          });
          console.log("PAGE VIEWS");
          console.log(userPageViews);
          console.log("MY LATEST PAGE VIEW");
          console.log({
            ...mySortedPageViews[0],
            viewed: new Date(mySortedPageViews[0].published.seconds * 1000),
          });
          console.log("SAME DAY?");
          const previouslyViewedToday = datesAreOnSameDay(
            date,
            new Date(mySortedPageViews[0].published.seconds * 1000)
          );
          console.log(previouslyViewedToday);
          if (previouslyViewedToday === false) {
            await updateDoc(profileNotificationsDocRef, {
              pageViews: arrayUnion({
                username: userObj.username,
                published: timestamp,
                postType: "pageView",
                name: fullName,
              }),
            });
          }
        } else {
          console.log("NO PREVIOUS PAGE VIEWS");
          await updateDoc(profileNotificationsDocRef, {
            pageViews: arrayUnion({
              username: userObj.username,
              published: timestamp,
              postType: "pageView",
              name: fullName,
            }),
          });
        }
      }
    });
  };

  useEffect(() => {
    console.log("MY PROFILE?");
    console.log(myProfile);
  }, [myProfile]);
  useEffect(() => {
    if (profileObj && profileObj.username) {
      fetchPageViews();
    }
  }, [profileObj]);

  useEffect(() => {
    console.log("LOADING?");
    console.log(loading);
  }, [loading]);

  if (loading === false && myProfile !== null && profileObj) {
    return (
      <>
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
                    {organizationData.name && `at ${organizationData.name}`}
                  </p>
                  <div className="profileLocation-contactInfo">
                    {profileObj.location && (
                      <p className="profileLocation">{profileObj.location}</p>
                    )}
                    <p
                      className="profileLocation-contactInfo-contact"
                      onClick={() => dispatch(setShowContactCardModal())}
                    >
                      Contact Info
                    </p>
                  </div>
                </div>
                <div className="profilePage__details2">
                  <span className="profilePage__details2-organization">
                    {organizationData.organizationLogo && (
                      <div>
                        <img
                          src={organizationData.organizationLogo}
                          alt={organizationData.name}
                        />
                      </div>
                    )}
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
            profileUsegrname,profileId, currUserName
            <p className="profileConnections">234</p>
          </span> */}
              <section className="  = profilePage__details3">
                <p className="profilePage__details3-Connections">
                  {(userConnections && userConnections) || 0} connections
                </p>
                {myProfile === false && (
                  <span className="profilePage__details3-buttons">
                    {loadingFollow && <ImSpinner2 className="loadingSpinner" />}
                    {following === true && pendingConnectionRequest === false && (
                      <button className="follow" onClick={() => unFollowUser()}>
                        Connected
                      </button>
                    )}
                    {following === false && pendingConnectionRequest === false && (
                      <button className="follow" onClick={() => followUser2()}>
                        Connect
                      </button>
                    )}
                    {following === false &&
                      pendingConnectionRequest === true && (
                        <button className="follow">Pending</button>
                      )}

                    <button
                      className="message"
                      onClick={() =>
                        history.push(`/messaging/users/${username}`)
                      }
                    >
                      Message
                    </button>
                  </span>
                )}
              </section>
              <div className="profilePage__header-profilePic">
                <img
                  src={
                    profileObj.profilePhotoURL ||
                    "https://w7.pngwing.com/pngs/841/727/png-transparent-computer-icons-user-profile-synonyms-and-antonyms-android-android-computer-wallpaper-monochrome-sphere.png"
                  }
                  alt={profileObj.username}
                />
              </div>
            </div>
            <div className="profilePage__About">
              <p className="title">About</p>
              <p
                className={!showFullSummary ? "about" : "about-full"}
                onClick={() => setShowFullSummary(!showFullSummary)}
              >
                {myProfile && userObj.summary}
                {!myProfile && summary}
                {!profileObj.summary &&
                  `*${
                    myProfile ? "Your profile " : profileObj.name.firstName
                  } has no profile summary*`}
              </p>
              {myProfile && !profileObj.summary && (
                <p
                  className="profilePage__About-addSummary"
                  onClick={() => dispatch(setShowEditSummaryModal())}
                >
                  Add a summary
                </p>
              )}
              <p
                className="seeMore"
                onClick={() => setShowFullSummary(!showFullSummary)}
              >
                {showFullSummary ? "show less.." : "see more..."}
              </p>
              {myProfile && (
                <BiEditAlt
                  className="profilePage__editSummary"
                  onClick={() => dispatch(setShowEditSummaryModal())}
                />
              )}
            </div>
            <div className="profilePage__featured">
              <div className="profilePage__featured-title">{`${profileObj.name.firstName}'s Latest Posts`}</div>

              {loadingPosts === false && profilePosts.length === 0 ? (
                <p>No posts from {profileObj.name.firstName}</p>
              ) : (
                <div className="profilePosts">
                  {profilePosts.length >= 1 &&
                    profilePosts.map((post) => (
                      <FeedPost
                        post={post}
                        organizationData={organizationData}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
          <RSidebar className="profilePage__RSidebar" />
        </div>
        {showContactCardModal && (
          <ContactInfoModal profileInfo={profileObj} following={following} />
        )}
        {showEditSummaryModal && <EditSummaryModal profileInfo={profileObj} />}
      </>
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
