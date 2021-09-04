import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { BsCalendar } from "react-icons/bs";
import { MdPhoto } from "react-icons/md";
import { RiArticleLine, RiVideoFill } from "react-icons/ri";
import CreatePostModal from "./CreatePostModal";
import "./MainSection.css";
import FeedPost from "./FeedPost";
const MainSection = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postInput, setPostInput] = useState("");
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
        <FeedPost />
        <FeedPost />
        <FeedPost />
        <FeedPost />
      </div>
      {showCreatePostModal && (
        <CreatePostModal setShowCreatePostModal={setShowCreatePostModal} />
      )}
    </div>
  );
};

export default MainSection;
