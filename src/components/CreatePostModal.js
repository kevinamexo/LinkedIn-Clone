import React, { useState, useRef } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { AiOutlineClose, AiFillCaretDown } from "react-icons/ai";
import { IoMdGlobe } from "react-icons/io";
import "./CreatePostModal.css";
import TextareaAutosize from "react-textarea-autosize";

import { db } from "../firebase/firebaseConfig";
import {
  query,
  collection,
  where,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  getDoc,
  getDocs,
  timestamp,
} from "firebase/firestore";
const CreatePostModal = ({ setShowCreatePostModal }) => {
  const [postInput, setPostInput] = useState("");
  const [error, setError] = useState("null");
  const [postType, setPostType] = useState("generic");
  const { userObj } = useSelector((state) => state.user);
  const authorId = "kamexo97";
  const { firstName, lastName, title, organization, username } = userObj;
  const [followDocRefId, setFollowDocRefId] = useState("");

  const publishPost = async (e) => {
    e.preventDefault();
    const format1 = "YYYY-MM-DD HH:mm:ss";
    const time = moment().format(format1);
    console.log("hello");

    try {
      //POST AND GET THE ID OF THE POST
      const postRef = await addDoc(collection(db, "posts"), {
        postText: postInput,
        authorId: "kamexo97",
        postType: "text",
        published: moment().format(format1),
      }).then((docRef) => {
        console.log("new Post Id" + docRef.id);
      });

      //FIND DOCUMENT IN FOLLOWS FOR THE USER THAT IS POSTING
      const followQ = query(
        collection(db, "follows"),
        where("username", "==", "kamexo97")
      );
      const followIdSnap = await getDocs(followQ);

      followIdSnap.forEach((doc) => {
        console.log("Doc id of users follow document" + doc.id);
        setFollowDocRefId(doc.id);
      });

      const followRef = doc(db, "follows", followDocRefId);
      const querySnapshot2 = await updateDoc(followRef, {
        recentPosts: arrayUnion({
          postText: postInput,
          authorId: "kamexo97",
          postType: "text",
          published: time,
        }),
        lastPost: time,
      });
    } catch (e) {
      console.log(e);
      console.log("error adding posts");
    }
  };

  const createPostBodyRef = useRef();
  return (
    <div className="createPostModal">
      <form className="createPostForm" onSubmit={publishPost}>
        <div className="createPost__header">
          <p>Create a Post</p>
          <AiOutlineClose
            className="createPost__header-close"
            onClick={() => setShowCreatePostModal(false)}
            tMod
          />
        </div>
        <div className="createPost__authorSection">
          <FaUserCircle className="createPost__authorPic" />
          <span className="createPost__authorSection-span">
            <p>Kevin Amexo</p>
            <button className="createPost__visibleTo">
              <IoMdGlobe />
              Everyone
              <AiFillCaretDown />
            </button>
          </span>
        </div>
        <div className="createPost__contentSection">
          {/* <textarea
            type="text"
            className="createPost__contentSection-body"
            value={postInput}
            onChange={(e) => setPostInput(e.target.value)}
            placeholder="What do you want to talk about?"
          /> */}
          <TextareaAutosize
            className="createPost__contentSection-body"
            style={{ resize: "none", width: "100%" }}
            placeholder="What do you want to talk about?"
            value={postInput}
            onChange={(e) => setPostInput(e.target.value)}
          />
        </div>
        <div className="createPost__footer">
          <button
            type="submit"
            className="createPost__footer-post"
            disabled={postInput == ""}
          >
            Post
          </button>
          {/* <button></button> */}
        </div>
      </form>
    </div>
  );
};

export default CreatePostModal;
