import React, { useState, useEffect, useRef } from "react";
import {
  query,
  collection,
  where,
  deleteDoc,
  doc,
  addDoc,
  collectionGroup,
  getDocs,
  Timestamp,
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
import { RiSendPlaneFill } from "react-icons/ri";
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
  const [commentReply, setCommentReply] = useState("");
  const [replyActive, setReplyActive] = useState(false);
  const [currentCommentUser, setCurrentCommentUser] = useState({});
  const [viewReplies, setViewReplies] = useState(false);
  const [commentReplyError, setCommentReplyError] = useState(false);
  const [commentLikes, setCommentLikes] = useState(0);
  const timeAgo = new TimeAgo("en-US");
  const storeProfileDetails = () => {
    console.log(comment.authorId);
    console.log(commentUsers);
    const authorId = comment.authorId;
    const userQuery = query(
      collection(db, "user"),
      where("username", "==", authorId)
    );
    console.log("COMMENT USERS");
    console.log(commentUsers);
    const userSnap = onSnapshot(userQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setCurrentCommentUser(doc.data());
      });
    });
  };

  const handleSendReply = async () => {
    let pathIds = comment.path.split("/").filter((c) => c !== "null");
    let parents = `posts/${comment.parentPost}/comments/`;
    let fullPathIds = pathIds.join("/comments/");
    let pathIdArray = (parents + fullPathIds).split("/");
    pathIdArray = [...pathIdArray, "comments"];
    console.log(pathIdArray);
    const date = new Date();
    const timestamp = Timestamp.fromDate(date);
    if (commentReply.length > 0) {
      try {
        const commentReplyRef = collection(db, ...pathIdArray);
        await addDoc(commentReplyRef, {
          text: commentReply,
          published: timestamp,
          authorId: userObj.username,
          parentComment: comment.commentId,
          parentPost: comment.parentPost,
        }).then(() => {
          setCommentReply("");
          setReplyActive(false);
        });
      } catch (e) {
        console.log(e);
        setTimeout(() => {
          setCommentReplyError(true);
        }, 5000);
      }
    }
  };

  const handleLikeComment = async () => {
    let pathIds = comment.path.split("/").filter((c) => c !== "null");
    let parents = `posts/${comment.parentPost}/comments/`;
    let fullPathIds = pathIds.join("/likes/");
    let pathIdArray = (parents + fullPathIds).split("/");
    pathIdArray = [...pathIdArray, "likes"];
    console.log(pathIdArray);
    const date = new Date();
    const timestamp = Timestamp.fromDate(date);

    try {
      const commentLikesRef = collection(db, ...pathIdArray);
      await addDoc(commentLikesRef, {
        published: timestamp,
        username: userObj.username,
        parentComment: comment.commentId,
        parentPost: comment.parentPost,
      });
    } catch (e) {
      console.log(e);
      setTimeout(() => {
        setCommentReplyError(true);
      }, 5000);
    }
  };

  const handleDeleteComment = async () => {
    console.log();
    let pathIds = comment.path.split("/").filter((c) => c !== "null");
    let parents = `posts/${comment.parentPost}/comments/`;
    let fullPathIds = pathIds.join("/comments/");
    let pathIdArray = (parents + fullPathIds).split("/");
    console.log(pathIdArray);
    await deleteDoc(doc(db, ...pathIdArray)).then(() => {
      console.log("DELETED COMMENT");
      // dispatch(setDeleteComment(comment));
    });
  };
  useEffect(() => {
    storeProfileDetails();
  }, [comment]);

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
                  onClick={async () => {
                    setOpenCommentMenu(false);
                    await handleDeleteComment();
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
        <p className="commentLikes">Likes</p>
        <AiOutlineLike
          className="commentLikesIcon"
          onClick={handleLikeComment}
        />
        <p className="commentLikesAmount">{commentLikes}</p>
        <BiDotsVertical className="commentSeperator" />
        <p className="commentReply" onClick={() => setReplyActive(true)}>
          Reply
        </p>
        <p className="commentReplies">3 replies</p>
      </div>
      {viewReplies === true && (
        <div style={{ marginLeft: "20px" }}>{nestedComments}</div>
      )}
      {replyActive === true && (
        <div className="commentReplySection">
          <form className="commentReplySection-form">
            <input
              type="text"
              name="commentReply"
              value={commentReply}
              onChange={(e) => {
                setCommentReply(e.target.value);
              }}
              className="commentReplySection-input"
              placeholder="Type your reply"
            />
            <div className="commentReplySection-actions">
              <p
                className="cancelReply"
                onClick={() => {
                  setCommentReply("");
                  setReplyActive(false);
                }}
              >
                Cancel
              </p>
              <RiSendPlaneFill
                className="commentReplySection-sendIcon"
                onClick={handleSendReply}
              />
            </div>
          </form>
        </div>
      )}

      {comment.children && comment.children.length > 0 && (
        <p
          className="viewCommentReplies"
          onClick={() => setViewReplies(!viewReplies)}
        >
          {viewReplies === true && comment.parentComment === null
            ? "Hide All Replies"
            : viewReplies === true && comment.parentComment !== null
            ? "Hide replies"
            : viewReplies === false
            ? "View replies"
            : null}
        </p>
      )}
    </>
  );
};

export default Comment;
