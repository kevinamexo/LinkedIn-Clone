import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { BsCalendar } from "react-icons/bs";
import { MdPhoto } from "react-icons/md";
import { RiArticleLine, RiVideoFill } from "react-icons/ri";
import CreatePostModal from "./CreatePostModal";
import ContactInfoModal from "./ContactInfoModal";
import "./MainSection.css";
import { useSelector, useDispatch } from "react-redux";
import {
  setShowCreatePostModal,
  setCloseCreatePostModal,
  setShowContactCardModal,
} from "../redux/features/modalsSlice";
import { setPosts, setAddToPosts } from "../redux/features/postsSlice";
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
import { set } from "react-hook-form";

const MainSection = () => {
  const [postInput, setPostInput] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(null);

  const dispatch = useDispatch();
  const { posts } = useSelector((state) => state.posts);
  const { userObj } = useSelector((state) => state.user);
  const {
    showUploadImage,
    showContactCardModal,
    showUploadVideo,
    showCreatePostModal,
  } = useSelector((state) => state.modals);
  const [feedPosts, setFeedPosts] = useState([]);
  const [uploadType, setUploadType] = useState(null);

  //GET USER FEED, LIMIT TO 5 POSTS

  let latestPosts = [];
  const getFeed = async () => {
    try {
      setLoadingPosts(true);
      const followedUsers = query(
        collection(db, "follows"),
        where("users", "array-contains", userObj.username),
        orderBy("lastPost", "desc"),
        limit(10)
      );
      const posts = await getDocs(followedUsers);
      posts.forEach((doc) => {
        console.log(doc.data());
        latestPosts = [...latestPosts, ...doc.data().recentPosts];
      });
      console.log("LATEST POSTS");
      console.log(latestPosts);
      const sortedPosts = latestPosts.sort((a, b) => a.published);
      dispatch(setPosts(sortedPosts));
      setFeedPosts(latestPosts);
      setLoadingPosts(false);
    } catch (e) {
      console.log(e);
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    console.log("hello");
    getFeed();

    return () => {
      dispatch(setPosts([]));
    };
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
        {posts && posts.map((post, idx) => <FeedPost post={post} idx={idx} />)}
        {posts.length === [] && loadingPosts === false && (
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
        <UploadModal setFeedPosts={setFeedPosts} feedPosts={posts} />
      )}
      {showUploadVideo && uploadType === "video" && (
        <UploadModal type="video" />
      )}
      {showContactCardModal && <ContactInfoModal />}
    </div>
  );
};

export default MainSection;
