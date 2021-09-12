import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { BsCalendar } from "react-icons/bs";
import { MdPhoto } from "react-icons/md";
import { RiArticleLine, RiVideoFill } from "react-icons/ri";
import CreatePostModal from "./CreatePostModal";
import "./MainSection.css";
import { useSelector } from "react-redux";
import FeedPost from "./FeedPost";
import { db } from "../firebase/firebaseConfig";
import {
  where,
  limit,
  orderBy,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
const MainSection = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postInput, setPostInput] = useState("");
  const [loadingPost, setLoadingPosts] = useState(null);
  const { userObj } = useSelector((state) => state.user);
  const [feedPosts, setFeedPosts] = useState([]);

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
            onClick={() => setShowCreatePostModal(true)}
          >
            Start a post
          </div>
        </div>
        <div className="mainSection__postTypes">
          <span className="mainSection__postType">
            <MdPhoto className="postType-photoIcon" />
            <p className="postType-label">Photo</p>
          </span>
          <span className="mainSection__postType">
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
        {feedPosts && feedPosts.map((post) => <FeedPost post={post} />)}
      </div>
      {showCreatePostModal && (
        <CreatePostModal setShowCreatePostModal={setShowCreatePostModal} />
      )}
    </div>
  );
};

export default MainSection;
