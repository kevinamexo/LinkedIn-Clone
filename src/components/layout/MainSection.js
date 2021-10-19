import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { BsCalendar } from "react-icons/bs";
import { MdPhoto } from "react-icons/md";
import { RiArticleLine, RiVideoFill } from "react-icons/ri";
import { AiFillCaretDown } from "react-icons/ai";
import CreatePostModal from "../modals/CreatePostModal";
import ContactInfoModal from "../modals/ContactInfoModal";
import "./MainSection.css";
import { useSelector, useDispatch } from "react-redux";

import {
  setPosts,
  setSortPostsOrder,
  setRemoveFromPosts,
  setPostsChanges,
} from "../../redux/features/postsSlice";
import {
  setNotifications,
  setNotificationChanges,
  setInitialNotificationTime,
} from "../../redux/features/notificationsSlice";
import FeedPost from "../FeedPost";
import UploadModal from "../modals/UploadModal";
import { db } from "../../firebase/firebaseConfig";
import {
  where,
  limit,
  orderBy,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import {
  setShowCreatePostModal,
  setShowUploadImage,
  setShowUploadVideo,
} from "../../redux/features/modalsSlice";

import InfiniteScroll from "react-infinite-scroll-component";
import { set } from "react-hook-form";
import _ from "lodash";
const MainSection = () => {
  const [postInput, setPostInput] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(null);
  const dispatch = useDispatch();
  const { posts, lastPost } = useSelector((state) => state.posts);
  const { userObj } = useSelector((state) => state.user);
  const { notifications, lastNotification, prevLastNotification } = useSelector(
    (state) => state.notifications
  );
  const {
    showUploadImage,
    showContactCardModal,
    showUploadVideo,
    showCreatePostModal,
  } = useSelector((state) => state.modals);
  const [feedPosts, setFeedPosts] = useState([]);
  const [uploadType, setUploadType] = useState(null);
  const [sortPosts, setSortPosts] = useState("latest");
  const [showSort, setShowSort] = useState(false);
  const sortMenuRef = useRef();
  //GET USER FEED, LIMIT TO 5 POSTS
  let lastPublished = null;
  let localPosts;
  useEffect(() => {
    console.log(posts.length);
  }, [posts]);

  const getFeed = async () => {
    let latestPosts = [];
    let followedUsers;
    try {
      setLoadingPosts(true);
      const postQuery =
        lastPublished !== null
          ? query(
              collection(db, "follows"),
              where("users", "array-contains", userObj.username),
              where("lastPost", ">=", lastPublished),
              orderBy("lastPost", "desc"),
              limit(10)
            )
          : query(
              collection(db, "follows"),
              where("users", "array-contains", userObj.username),
              orderBy("lastPost", "desc"),
              limit(10)
            );

      let postsWithDate = [];
      let notificationsWithDate = [];
      let nextLastNotificationTime;
      const fetchedPosts = onSnapshot(postQuery, (querySnapshot) => {
        let lastNotificationTimesWithDate = [];
        let lastNotificationTimes = [];
        let unsortedPosts = [];
        let unsortedNotifications = [];
        console.log("NEW SNAPSHOT");
        if (lastPublished === null) {
          querySnapshot.forEach((doc) => {
    
            unsortedPosts = [...unsortedPosts, ...doc.data().recentPosts];

            unsortedNotifications = [
              ...unsortedNotifications,
              ...doc.data().notifications,
            ];
            console.log(doc.data());

            //FETCH LAST NOTIFICATION TIME FROM FIRESTORE
            lastNotificationTimes = [
              ...lastNotificationTimes,
              doc.data().lastNotification.toDate(),
            ];
            if (doc.data().username === userObj.username) {
              nextLastNotificationTime = doc.data().lastNotification;
              dispatch(
                setInitialNotificationTime(nextLastNotificationTime.toDate())
              );
            }
          });

          let sortedLastNotificationTimes = lastNotificationTimes.sort(
            function (a, b) {
              return new Date(b) - new Date(a);
            }
          );
          console.log(nextLastNotificationTime);

          //CONVERT TIMESTAMPS TO DATES
          
          unsortedPosts.forEach((p) => {
            postsWithDate = [
              ...postsWithDate,
              { ...p, published: p.published.toDate() },
            ];
          });

          unsortedNotifications.forEach((p) => {
            notificationsWithDate = [...notificationsWithDate, p];
          });

          if(postsWithDate.length>0){
            dispatch(setPosts(postsWithDate));
          }
          if(notificationsWithDate.length>0){

            dispatch(setNotifications(notificationsWithDate));
          }

          if (postsWithDate.length > 0) {
            lastPublished = postsWithDate[0].published;
          }
        } else if (lastPublished !== null) {
          const changesSnapshot = [];
          const notificationChanges = [];
          const fullSnap = [];
          const fullNotificationsSnap = [];
          let changeType;
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === "removed") {
              changeType = "DELETED";
            } else {
              changeType = "Added";
            }
            console.log("NEW CHANGE");
            changesSnapshot.push(...change.doc.data().recentPosts);
            notificationChanges.push(...change.doc.data().notifications);
          });

          querySnapshot.forEach((doc) => {
            fullSnap.push(...doc.data().recentPosts);
            fullNotificationsSnap.push(...doc.data().notifications);
          });

          let changesWithDate = [];
          let fullSnapWithDate = [];

          let notificationsChangesWithDate = [];
          let fullNotificationsSnapWithDate = [];

          // dispatch(setPostsChanges(changesWithDate));setAddNewPosts
          changesSnapshot.forEach((p) => {
            changesWithDate = [
              ...changesWithDate,
              { ...p, published: p.published.toDate() },
            ];
          });

          notificationChanges.forEach((p) => {
            notificationsChangesWithDate = [
              ...notificationsChangesWithDate,
              { ...p, published: p.published.toDate() },
            ];
          });

          console.log("CHANGES WITH DATE");
          console.log(changesWithDate);
          console.log("NOTIFICATION CHANGES WITH DATE");
          console.log(notificationsChangesWithDate);
          fullSnap.forEach((p) => {
            fullSnapWithDate = [
              ...fullSnapWithDate,
              { ...p, published: p.published.toDate() },
            ];
          });
          fullNotificationsSnap.forEach((p) => {
            fullNotificationsSnapWithDate = [
              ...fullNotificationsSnapWithDate,
              { ...p, published: p.published.toDate() },
            ];
          });

          function comparer(otherArray) {
            return function (current) {
              return (
                otherArray.filter(function (other) {
                  return (
                    other.postRefId === current.postRefId &&
                    other.published === current.published
                  );
                }).length == 0
              );
            };
          }

          let newItems = changesWithDate.filter(
            ({ postRefId: id1 }) =>
              !postsWithDate.some(({ postRefId: id2 }) => id2 === id1)
          );
          console.log("NEW ITEMS");
          console.log(newItems);
          newItems = newItems.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          });

          let newNotifications = notificationsChangesWithDate.filter(
            ({ postRefId: id1 }) =>
              !notificationsWithDate.some(({ postRefId: id2 }) => id2 === id1)
          );

          console.log("NEW NOTIFICATIONS");
          console.log(newNotifications);
          let deleted = postsWithDate.filter(
            ({ postRefId: id1 }) =>
              !fullSnapWithDate.some(({ postRefId: id2 }) => id2 === id1)
          );

          console.log("DELETED ITEMS");
          console.log(deleted);
          newItems = newItems.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          });

          console.log("NEW NOTIFICATIONS");

          newNotifications = newNotifications.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          });

          console.log(newNotifications);

          ///ADD NEW ITEMS TO POSTS
          if (newItems.length >= 1) {
            dispatch(setPostsChanges({ type: "NEW_ITEMS", items: newItems }));

            console.log("newItems" + JSON.stringify(newItems));
            newItems.forEach((y) => {
              postsWithDate = [y, ...postsWithDate];
            });
          }
          if (newNotifications.length >= 1) {
            console.log(newNotifications);
            dispatch(setNotificationChanges(newNotifications));
            console.log("NEW NOTIFICATION");
            newNotifications.forEach((y) => {
              notificationsWithDate = [y, ...notificationsWithDate];
            });
          }

          function returnIndex(obj) {
            let s = postsWithDate.findIndex(
              (p) => p.postRefId === obj.postRefId
            );

            return s;
          }
          let indexes = [];
          if (deleted.length >= 1) {
            console.log(deleted[0]);
            deleted.forEach((f) => indexes.push(returnIndex(f)));
            indexes.filter((x) => x !== -1);
            console.log("index of deleted");
            console.log(indexes);
            console.log(postsWithDate[indexes]);
            let n = [...postsWithDate];
            dispatch(setRemoveFromPosts(Number(indexes)));
            const deleteItem = n.splice(Number(indexes[0]), 1);
            console.log("removed");
            console.log(n);
            postsWithDate = n;
            console.log(postsWithDate);
            indexes = [];
          }

          if (changesWithDate && changesWithDate.length > 0) {
            lastPublished = changesWithDate[0].published;
          }
        }
      });

      setLoadingPosts(false);
    } catch (e) {
      console.log(e);
      setLoadingPosts(false);
    }
  };
  const getNotifications = async () => {};

  useEffect(() => {
    getFeed();
    return () => {
      setLoadingPosts(null);
      let followedUsers;
      // dispatch(setPosts([]));
      // let postsSample = [];
    };
  }, []);

  useEffect(() => {
    if (sortPosts) {
      dispatch(setSortPostsOrder(sortPosts));
    }
  }, [sortPosts]);

  const notificationsAmount = notifications.length;
  const newNotificationsList = notifications.filter((n) => {
    if (notifications.published > prevLastNotification) {
      return n;
    }
  });

  return (
    <div className="mainSection">
      <div className="mainSection__post">
        <div className="mainSection__postInput">
          <FaUserCircle className="mainSection__profilePic" />
          <div
            className="mainSection__startPost"
            onClick={() => dispatch(setShowCreatePostModal())}
          >
            Start a post
          </div>
        </div>
        <div className="mainSection__postTypes">
          <span
            className="mainSection__postType"
            onClick={() => {
              setUploadType("images");
              dispatch(setShowUploadImage());
            }}
          >
            <MdPhoto className="postType-photoIcon" />
            <p className="postType-label">Photo</p>
          </span>
          <span
            className="mainSection__postType"
            onClick={() => {
              setUploadType("video");
              dispatch(setShowUploadVideo());
            }}
          >
            <RiVideoFill className="postType-vidIcon" />
            <p className="postType-label">Video</p>
          </span>
          <span className="mainSection__postType">
            <BsCalendar className="postType-eventIcon" />
            <p className="postType-label">Event</p>
          </span>
          <span className="mainSection__postType">
            <RiArticleLine className="postType-articleIcon" />
            <p className="postType-label">Write article</p>
          </span>
        </div>
      </div>
      <section className="sortPosts">
        <p className="sortLabel">Sort by:</p>
        <p
          className={`sortValue-${sortPosts === "most_likes" && "likes"}`}
          onClick={() => {
            setShowSort(!showSort);
          }}
        >
          {sortPosts === "latest" && "Latest"}
          {sortPosts === "oldest" && "Oldest"}
          {sortPosts === "most_likes" && "Most Likes"}
          <AiFillCaretDown />
        </p>
        {showSort == true && (
          <div className="sortValuesMenu" ref={sortMenuRef}>
            <p
              className="sortMenuValue"
              onClick={() => {
                let sorted = "latest";
                setSortPosts("latest");

                setShowSort(false);
              }}
            >
              Latest
            </p>
            <p
              className="sortMenuValue"
              onClick={() => {
                setSortPosts("oldest");
                setShowSort(false);
              }}
            >
              Oldest
            </p>
            <p
              className="sortMenuValue"
              onClick={() => {
                setSortPosts("most_likes");
                setShowSort(false);
              }}
            >
              Most Likes
            </p>
          </div>
        )}
      </section>
      <div className="mainSection__feed">
        {posts &&posts.length>=1&&
          posts.map((post, idx) => (
            <FeedPost post={post} key={idx} idx={idx} />
          ))}
        {posts.length === 0 && loadingPosts === false && (
          <p className="no-posts">No posts in your feed</p>
        )}
      </div>
      {showCreatePostModal && (
        <CreatePostModal
          setShowCreatePostModal={setShowCreatePostModal}
          setFeedPosts={setFeedPosts}
          feedPosts={posts}
        />
      )}
      {showUploadImage && uploadType === "images" && (
        <UploadModal
          type="images"
          setFeedPosts={setFeedPosts}
          feedPosts={posts}
        />
      )}
      {showUploadVideo && uploadType === "video" && (
        <UploadModal type="video" />
      )}
      {showContactCardModal && <ContactInfoModal />}
    </div>
  );
};

export default MainSection;
