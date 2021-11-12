import React, { useState, useEffect, useRef } from "react";
import {
  query,
  collection,
  where,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "./Comment.css";
import useOutsideClick from "../customHooks";
import { useDispatch, useSelector } from "react-redux";
import { addUserDetails, setDeleteComment } from "../redux/features/postPage";
import { FaUserCircle, FaTrashAlt } from "react-icons/fa";
import { AiOutlineLike, AiOutlineLine } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { BiDotsVertical } from "react-icons/bi";
import Skeleton from "react-loading-skeleton";
import { nameFromObject } from "../customHooks";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
const Comment = ({ comment }) => {
  const dispatch = useDispatch();
  const commentMenuIconRef = useRef();
  const commentMenuRef = useRef();
  const { commentUsers } = useSelector((state) => state.postPage);
  const { userObj } = useSelector((state) => state.user);
  const [userSent, setUserSent] = useState(false);
  const [openCommentMenu, setOpenCommentMenu] = useState(false);
  const [currentCommentUser, setCurrentCommentUser] = useState({});
  const [viewReplies, setViewReplies] = useState(false);
  const timeAgo = new TimeAgo("en-US");
  const storeProfileDetails = () => {
    const authorId = comment.authorId;
    const userQuery = query(
      collection(db, "user"),
      where("username", "==", authorId)
    );

    const userSnap = onSnapshot(userQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        dispatch(addUserDetails(doc.data()));
        console.log(doc.data());
        setUserSent(true);
      });
    });
  };

  const handleDeleteComment = async () => {
    await deleteDoc(doc(db, "comments", comment.commentId));
    dispatch(setDeleteComment(comment));
  };
  useEffect(() => {
    console.log("COMMENT SECONDS");
    console.log(comment.published.seconds);
    const commentObj = { ...comment };
    console.log(commentObj);
    const userExists = commentUsers.some(
      (u) => u.authorId === commentObj.authorId
    );
    console.log(userExists);
    if (userExists === false) {
      storeProfileDetails();
    }
  }, [comment]);
  useEffect(() => {
    if (userSent === true) {
      console.log(
        commentUsers.find((user) => user.username === comment.authorId)
      );
      if (commentUsers.find((user) => user.username === comment.authorId)) {
        setCurrentCommentUser(
          commentUsers.find((user) => user.username === comment.authorId)
        );
      }
    }
  }, [commentUsers, userSent, comment]);

  useOutsideClick(commentMenuRef, commentMenuIconRef, (e) => {
    console.log(e.target);
    setOpenCommentMenu(false);
  });
  const nestedComments = (comment.children || []).map((comment) => {
    return <Comment comment={comment} />;
  });
  return (
    <>
      <div className="commentContainer">
        {currentCommentUser && currentCommentUser.profilePhotoURL ? (
          <img
            src={currentCommentUser.profilePhotoURL}
            className="comment__profilePhoto"
          />
        ) : (
          <FaUserCircle className="comment__profilePhoto-icon" />
        )}
        <div className="comment-body">
          <span className="commentName_time">
            <p className="commentUserName">
              {nameFromObject(currentCommentUser)}
            </p>
            <p className="commentTime">
              {timeAgo.format(
                new Date(comment.published.seconds * 1000),
                "mini"
              )}
              {userObj.username === comment.authorId && (
                <BsThreeDots
                  className="commentTime-more"
                  onClick={() => setOpenCommentMenu(!openCommentMenu)}
                  ref={commentMenuIconRef}
                />
              )}
            </p>
            {userObj.username === comment.authorId && openCommentMenu === true && (
              <span className="postPage__commentMenu" ref={commentMenuRef}>
                <li
                  className="postPage__commentMenu-item"
                  onClick={() => {
                    setOpenCommentMenu(false);
                    dispatch(setDeleteComment(comment));
                  }}
                >
                  Delete Comment
                  <FaTrashAlt className="commentMenu-delete" />
                </li>
              </span>
            )}
          </span>
          <p className="commentUserTitle">
            {currentCommentUser &&
              currentCommentUser.title &&
              currentCommentUser.title}
          </p>
          <p className="commentComment">{comment.text}</p>
        </div>
      </div>
      <div className="commentReactions">
        <p className="commentLikes">Like</p>
        <AiOutlineLike className="commentLikesIcon" />
        <p className="commentLikesAmount">{comment.likes || 0}</p>
        <BiDotsVertical className="commentSeperator" />
        <p className="commentReply">Reply</p>
      </div>
      {viewReplies === true && (
        <div style={{ marginLeft: "20px" }}>{nestedComments}</div>
      )}

      {comment.children && comment.children.length > 0 && (
        <p
          className="viewCommentReplies"
          onClick={() => setViewReplies(!viewReplies)}
        >
          {viewReplies === true ? "Hide All Replies" : "View replies"}
        </p>
      )}
    </>
  );
};

export default Comment;
