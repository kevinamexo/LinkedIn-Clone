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
  updateDoc,
  arrayUnion,
  arrayRemove,
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
  const { commentUsers, commentsWithPath, addedPaths } = useSelector(
    (state) => state.postPage
  );
  const { userObj } = useSelector((state) => state.user);
  const [userSent, setUserSent] = useState(false);
  const [openCommentMenu, setOpenCommentMenu] = useState(false);
  const [commentReply, setCommentReply] = useState("");
  const [replyActive, setReplyActive] = useState(false);
  const [currentCommentUser, setCurrentCommentUser] = useState({});
  const [viewReplies, setViewReplies] = useState(false);
  const [repliesAmount, setRepliesAmount] = useState(0);
  const [commentReplyError, setCommentReplyError] = useState(false);
  const [likedComment, setLikedComment] = useState(null);
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
    let fullPathIds = pathIds.join("/comments/");
    let pathIdArray = (parents + fullPathIds).split("/");

    console.log(pathIdArray);
    const date = new Date();
    const timestamp = Timestamp.fromDate(date);

    try {
      const commentDocRef = doc(db, ...pathIdArray);
      const like = comment.likes.find(
        (user) => user.username === userObj.username
      );
      if (like) {
        await updateDoc(commentDocRef, {
          likes: arrayRemove(like),
        });
      } else {
        await updateDoc(commentDocRef, {
          likes: arrayUnion({
            username: userObj.username,
            published: timestamp,
          }),
        });
      }
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
  useEffect(() => {
    if (comment && comment.likes) {
      console.log(
        comment.likes.some((likes) => likes.username === userObj.username)
      );
      setLikedComment(
        comment.likes.some((likes) => likes.username === userObj.username)
      );
    }
  }, [comment]);

  useOutsideClick(commentMenuRef, commentMenuIconRef, (e) => {
    console.log(e.target);
    setOpenCommentMenu(false);
  });
  const nestedComments = (comment.children || []).map((comment) => {
    return <Comment comment={comment} />;
  });

  function countReplies(commentObj) {
    console.log(commentsWithPath);
    const commentWithPath = commentsWithPath.find(
      ({ commentId }) => commentId === comment.commentId
    );
    console.log("FOUND");
    console.log(commentWithPath);
    if (commentWithPath) {
      console.log(commentsWithPath);
      console.log("COMMENT WITH PATH  PATH IS");
      console.log(commentWithPath);
      console.log(typeof commentWithPath);
      console.log(commentWithPath.path);
      const amount = commentsWithPath.filter(
        (c) =>
          c.commentId !== commentWithPath.commentId &&
          c.path.includes(commentWithPath.path)
      );
      console.log(amount);
      setRepliesAmount(amount.length);
    } else {
      setRepliesAmount(0);
    }
    // return amount.length;
  }
  function generateRepliesText(amount) {
    if (amount === 0) {
      return "No replies";
    } else if (amount === 1) {
      return `1 reply`;
    } else if (amount > 1) {
      return `${amount} replies`;
    }
  }
  useEffect(() => {
    console.log("COUNTING REPLIES");
    if (addedPaths === true) {
      countReplies(comment);
    }
  }, [comment.commentId, addedPaths, commentsWithPath]);
  useEffect(() => {}, [comment]);
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
        <div
          className={`${
            likedComment
              ? "commentReactionsLikes-liked"
              : "commentReactionsLikes"
          }`}
          onClick={handleLikeComment}
        >
          <p
            className={` ${
              likedComment ? "commentLikes-liked" : "commentLikes"
            }`}
          >
            {likedComment ? "Liked" : "Like"}
          </p>
          <AiOutlineLike className="commentLikesIcon" />
          <p className="commentLikesAmount">
            {comment.likes ? comment.likes.length : 0}
          </p>
        </div>
        <BiDotsVertical className="commentSeperator" />
        <p className="commentReply" onClick={() => setReplyActive(true)}>
          Reply
        </p>
        <p className="commentReplies">{generateRepliesText(repliesAmount)}</p>
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
