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
  setAddToPosts,
  setSortedPosts,
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
  const { posts, lastPost, sortedPosts } = useSelector((state) => state.posts);
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

      setLoadingPosts(false);
    } catch (e) {
      console.log(e);
      setLoadingPosts(false);
    }
  };

  const getPosts = () => {
    const postsQuery = query(
      collection(db, "follows"),
      where("users", "array-contains", userObj.username)
    );
    const postsSnapshot = onSnapshot(postsQuery, (querySnapshot) => {
      let postsArr = [];
      querySnapshot.docChanges().forEach((change) => {
        if (change.type !== "removed" && change.doc.data()) {
          postsArr.push(...change.doc.data().recentPosts);
        }
      });
      console.log("New items are:");
      console.log(postsArr);
      const postsArr2 = postsArr.sort((a, b) => {
        return new Date(b.published) - new Date(a.published);
      });
      console.log(postsArr2[0]);
      console.log(posts);

      dispatch(setAddToPosts(postsArr));
    });
  };

  useEffect(() => {
    getPosts();
    return () => {
      setLoadingPosts(null);
      let followedUsers;
      // dispatch(e([]));
      // let postsSample = [];
    };
  }, []);

  useEffect(() => {
    if (sortPosts) {
      dispatch(setSortPostsOrder(sortPosts));
    }
  }, [sortPosts]);

  // useEffect(() => {
  //   if (posts) {
  //     let postsCopy = [...posts];
  //     const sortedPosts = postsCopy.sort((a, b) => {
  //       return (
  //         new Date(b.published.seconds * 1000) -
  //         new Date(a.published.seconds * 1000)
  //       );
  //     });
  //     console.log("THE LATEST POST IS");
  //     console.log(sortedPosts[0]);
  //     dispatch(setSortedPosts(sortedPosts));
  //   }
  // }, [posts]);
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
        <p className="sortLabel">Sort by: </p>
        <p
          className={`sortValue-${sortPosts === "most_likes" && "likes"}`}
          onClick={() => {
            setShowSort(!showSort);
          }}
        >
          {sortPosts === "latest" && " Latest"}
          {sortPosts === "oldest" && " Oldest"}
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
        {posts &&
          posts.length >= 1 &&
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
