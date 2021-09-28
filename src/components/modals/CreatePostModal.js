import React, { useState, useRef } from "react";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { setCloseModal } from "../../redux/features/modalsSlice";
import { setAddToPosts } from "../../redux/features/postsSlice";
import { FaUserCircle } from "react-icons/fa";
import { AiOutlineClose, AiFillCaretDown } from "react-icons/ai";
import { IoMdGlobe } from "react-icons/io";
import "./CreatePostModal.css";
import TextareaAutosize from "react-textarea-autosize";
// import { serverTimestamp } from "firebase/database";
import BeatLoader from "react-spinners/BeatLoader";
import { db } from "../../firebase/firebaseConfig";
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
  Timestamp,
} from "firebase/firestore";

import * as frb from "firebase/firestore";
const CreatePostModal = ({ feedPosts, setFeedPosts }) => {
  const [postInput, setPostInput] = useState("");
  const [error, setError] = useState("null");
  const [postType, setPostType] = useState("generic");
  const [posting, setPosting] = useState(null);
  const dispatch = useDispatch();
  const { userObj } = useSelector((state) => state.user);
  // const authorId = "kamexo97";
  const { firstName, lastName, title, organization, username } = userObj;
  const [followDocRefId, setFollowDocRefId] = useState("");

  const publishPost = async (e) => {
    e.preventDefault();
    const format1 = "YYYY-MM-DD HH:mm:ss";
    const time = moment().format(format1);
    console.log("hello");

    try {
      //POST AND GET THE ID OF THE POST
      let postDocId;
      setPosting(true);
      let date = new Date();
      console.log(date);
      let timestamp = Timestamp.fromDate(date);
      const postRef = await addDoc(collection(db, "posts"), {
        postText: postInput,
        authorId: userObj.username,
        postType: "text",
        published: timestamp,
      }).then((docRef) => {
        console.log("new Post Id" + docRef.id);
        postDocId = docRef.id;
        console.log("post doc post collection document id: ");
        console.log(postDocId);
      });
      //FIND DOCUMENT IN FOLLOWS FOR THE USER THAT IS POSTING
      const followQ = query(
        collection(db, "follows"),
        where("username", "==", userObj.username)
      );
      const followIdSnap = await getDocs(followQ);
      let y;

      followIdSnap.forEach((doc) => {
        y = doc.id;
        console.log("Doc id of users follow document" + doc.id);
        setFollowDocRefId(doc.id);
      });

      console.log(timestamp);
      const followRef = doc(db, "follows", y);
      console.log("Adding second");
      console.log("postDocId");
      console.log(postDocId);
      console.log("NEW POST USERNAME " + userObj.username);
      const querySnapshot2 = await updateDoc(followRef, {
        recentPosts: arrayUnion({
          postText: postInput,
          authorId: userObj.username,
          postType: "text",
          published: timestamp,
          postRefId: postDocId,
        }),

        lastPost: timestamp,
      });

      const likesRef = await addDoc(collection(db, "likes"), {
        postId: postDocId,
        likes: 0,
        users: [],
      }).then(() => console.log("added interactions collections"));

      setTimeout(() => {
        console.log("confirming post document id:");
        console.log(postDocId);
        setPosting(false);
        dispatch(
          setAddToPosts({
            postText: postInput,
            authorId: userObj.username,
            postType: "text",
            published: timestamp,
            postRefId: postDocId,
            likes: 0,
          })
        );
        dispatch(setCloseModal());
      }, 1000);
    } catch (e) {
      console.log(e);
      console.log("error adding posts");
    }
  };

  const createPostBodyRef = useRef();
  const name = userObj.name
    ? `${
        userObj.name.firstName.charAt(0).toUpperCase() +
        userObj.name.firstName.slice(1)
      } ${
        userObj.name.lastName.charAt(0).toUpperCase() +
        userObj.name.lastName.slice(1)
      }`
    : null;
  return (
    <div className="createPostModal">
      <form className="createPostForm" onSubmit={publishPost}>
        <div className="createPost__header">
          <p>Create a Post</p>
          <AiOutlineClose
            className="createPost__header-close"
            onClick={() => dispatch(setCloseModal())}
            tMod
          />
        </div>
        <div className="createPost__authorSection">
          {userObj.profilePhotoURL ? (
            <img
              className="createPost__authorPic"
              src={userObj.profilePhotoURL}
            />
          ) : (
            <FaUserCircle className="createPost__authorPic" />
          )}
          <span className="createPost__authorSection-span">
            <p>{name}</p>
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
        {posting && (
          <div className="createPost__loading-post">
            <h2>Posting</h2>
            <BeatLoader size={15} loading={true} color="#0a66c2" />
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePostModal;
