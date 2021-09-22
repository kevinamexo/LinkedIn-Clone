import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { BsCalendar } from "react-icons/bs";
import { MdPhoto } from "react-icons/md";
import { RiArticleLine, RiVideoFill } from "react-icons/ri";
import CreatePostModal from "./CreatePostModal";
import "./MainSection.css";
import { useSelector, useDispatch } from "react-redux";
import {
  setShowCreatePostModal,
  setCloseCreatePostModal,
} from "../redux/features/modalsSlice";
import FeedPost from "./FeedPost";
import UploadModal from "./UploadModal";
import { db } from "../firebase/firebaseConfig";
import {
  where,
  limit,
  orderBy,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import {
  setShowUploadImage,
  setShowUploadVideo,
} from "../redux/features/modalsSlice";

import InfiniteScroll from "react-infinite-scroll-component";

const MainSection = () => {
  const [postInput, setPostInput] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(null);
  const dispatch = useDispatch();
  const { userObj } = useSelector((state) => state.user);
  const { showUploadImage, showUploadVideo, showCreatePostModal } = useSelector(
    (state) => state.modals
  );
  const [feedPosts, setFeedPosts] = useState([]);
  const [uploadType, setUploadType] = useState(null);

  //GET USER FEED, LIMIT TO 5 POSTS

  let latestPosts = [];
  const getFeed = async () => {
    try {
      const followedUsers = query(
        collection(db, "follows"),
        where("users", "array-contains", "kamexo97"),
        orderBy("lastPost", "desc"),
        limit(10)
      );
      const posts = await getDocs(followedUsers);
      posts.forEach((doc) => {
        latestPosts = [...latestPosts, ...doc.data().recentPosts];
      });
      console.log("LATEST POSTS");
      console.log(latestPosts);
      setFeedPosts(latestPosts);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    console.log("hello");
    getFeed();
  }, []);

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
              console.log("siiiuuuu");
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
      <div className="mainSection__feed">
        {feedPosts &&
          feedPosts.map((post, idx) => (
            <FeedPost
              post={post}
              feedPosts={feedPosts}
              setFeedPosts={setFeedPosts}
              idx={idx}
            />
          ))}
        {feedPosts.length === 0 && loadingPosts === false && (
          <p className="no-posts">No posts in your feed</p>
        )}
      </div>
      {showCreatePostModal && (
        <CreatePostModal
          setShowCreatePostModal={setShowCreatePostModal}
          setFeedPosts={setFeedPosts}
          feedPosts={feedPosts}
        />
      )}
      {showUploadImage && uploadType === "images" && (
        <UploadModal
          type="images"
          setFeedPosts={setFeedPosts}
          feedPosts={feedPosts}
        />
      )}
      {showUploadVideo && uploadType === "video" && (
        <UploadModal type="video" />
      )}
    </div>
  );
};

export default MainSection;
