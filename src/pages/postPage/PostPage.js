import React, { useState, useEffect, useRef } from "react";
import FeedPost from "../../components/FeedPost";
import { FaUserCircle, FaCaretDown } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi";

import { useHistory, useParams } from "react-router-dom";
import { nameFromObject } from "../../customHooks";
import Skeleton from "react-loading-skeleton";
import SyncLoader from "react-spinners/SyncLoader";
import Comment from "../../components/Comment";
import { useSelector, useDispatch } from "react-redux";
import {
  setAddPostComment,
  setDeleteComment,
} from "../../redux/features/postPage";
import {
  doc,
  getDoc,
  addDoc,
  query,
  collection,
  collectionGroup,
  onSnapshot,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./PostPage.css";
import FadeLoader from "react-spinners/FadeLoader";
import useOutsideClick from "../../customHooks";
const PostPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { userObj } = useSelector((state) => state.user);
  const { comments, loadedComments } = useSelector((state) => state.postPage);
  const [initCommentFetch, setInitCommentFetch] = useState(null);
  const [postObject, setPostObject] = useState({});
  const [postProfileObject, setPostProfileObject] = useState({});
  const [commentInput, setCommentInput] = useState("");
  const [addingComment, setAddingComment] = useState(null);
  const [loadingProfileDetails, setLoadingProfileDetails] = useState(null);
  const history = useHistory();
  const commentFilterMenuRef = useRef();
  const commentFilterLabel = useRef();
  const [openCommentFilterMenu, setOpenCommentFilterMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullyNestedComments, setFullyNestedComments] = useState([]);
  const fetchPostObject = async () => {
    setLoading(true);
    try {
      console.log(postId);
      const postDoc = doc(db, "posts", `${postId}`);
      const docSnap = await getDoc(postDoc);
      if (docSnap.exists()) {
        setPostObject({ ...docSnap.data(), postRefId: docSnap.id });
      } else {
        setPostObject({});
        setTimeout(() => history.push("/"), 4000);
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      setPostObject({});
      setLoading(false);
      setTimeout(() => history.push("/"), 4000);
    }
  };

  const fetchPostUser = async () => {
    try {
      setLoadingProfileDetails(true);
      const profileQuery = query(
        collection(db, "user"),
        where("username", "==", postObject.authorId)
      );
      const profileSnapshot = await getDocs(profileQuery);
      profileSnapshot.forEach((doc) => {
        if (doc.data().username) {
          setPostProfileObject(doc.data());
        }
      });
      setLoadingProfileDetails(false);
    } catch (e) {
      console.log(e);
    }
  };

  const commentOnPost = async (e, data) => {
    e.preventDefault();
    console.log("COMMENTING ON POST");
    setAddingComment(true);
    let date = new Date();
    console.log(date);
    let timestamp = Timestamp.fromDate(date);
    // const postDoc = doc(db, "posts", postObject.postRefId, "comments");
    try {
      if (data.text.length > 0) {
        await addDoc(
          collection(db, "posts", postObject.postRefId, "comments"),
          {
            published: timestamp,
            text: commentInput,
            authorId: userObj.username,
            parentComment: null,
            parentPost: postId,
          }
        ).then(() => {
          setCommentInput("");
          setAddingComment(false);
        });
      }
    } catch (e) {
      console.log(e);
      setCommentInput("");
    }
  };

  const postCommentsListener = () => {
    console.log("listening for comments");
    const postCommentQuery = query(
      collectionGroup(db, "comments"),
      where("parentPost", "==", postId)
    );
    const postCommentSnap = onSnapshot(postCommentQuery, (querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          dispatch(
            setAddPostComment({
              ...change.doc.data(),
              commentId: change.doc.id,
            })
          );
        } else if (change.type === "removed") {
          dispatch(setDeleteComment(change.doc.data()));
        }
      });
      setInitCommentFetch(true);
    });
  };

  const getCommentsWithChildren = (commentArr) => {
    const commentsWithChildren = [];
    commentArr.forEach((comment) => {
      commentsWithChildren.push({
        ...comment,
        children: [],
      });
    });
    return commentsWithChildren;
  };

  const getBaseCommentsWithChildren = (commentsArr) => {
    const commentMap = {};
    commentsArr.forEach((comment) => {
      commentMap[comment.commentId] = {
        path: `${comment.parentComment}/${comment.commentId}`,
        ...comment,
      };
    });
    commentsArr.forEach((comment) => {
      if (comment.parentComment !== null) {
        // commentMap[comment.parentComment]["children"].push(comment);
        const parent = commentMap[comment.parentComment];
        (parent.children = parent.children || []).push({
          ...comment,
          path: `${parent.path}/${comment.commentId}`,
        });
      }
    });
    console.log("COMMENT MAP CREATED");
    console.log(commentMap);
    const nestedComments = [];
    commentsArr.forEach((commentItem) => {
      if (commentItem.parentComment === null) {
        nestedComments.push({
          ...commentItem,
          children: commentMap[commentItem.commentId].children,
          path: commentMap[commentItem.commentId].path,
        });
      }
    });
    return nestedComments;
  };

  useEffect(() => {
    const g = getCommentsWithChildren(comments);
    const fullNestComments = getBaseCommentsWithChildren(g);
    setFullyNestedComments(fullNestComments);
    console.log("FULLY NESTED COMMENTS  ");
    console.log(fullNestComments);
  }, [comments]);

  useEffect(() => {
    console.log("LOADING POST");
    fetchPostObject();
  }, []);

  useEffect(() => {
    console.log("POST OBJECT");
    console.log(postObject);
    if (postObject.authorId) {
      fetchPostUser();
    }
  }, [postObject]);
  useEffect(() => {
    if (postObject.postRefId && postProfileObject.username) {
      postCommentsListener();
    }
  }, [postObject.text, postProfileObject]);

  useEffect(() => {
    console.log(postProfileObject);
  }, [postProfileObject]);

  useOutsideClick(commentFilterMenuRef, commentFilterLabel, (e) => {
    setOpenCommentFilterMenu(false);
  });
  if (loading === true) {
    return (
      <div className="postPage">
        <div className="loading-spinner-container">
          <FadeLoader
            height={7}
            width={2}
            radius={1}
            margin={2}
            color={"#0a66c2"}
            loading={true}
            className="spinner"
          />
        </div>
      </div>
    );
  } else if (loading === false && postObject.authorId) {
    return (
      <div className="postPage">
        <div className="postPageSections">
          <div className="postPage__section1">
            <div className="post__profileSummary">
              <div className="post__profileSummary-header">
                {postProfileObject && postProfileObject.coverPhotoURL ? (
                  <img
                    src={postProfileObject.coverPhotoURL}
                    alt={`${postProfileObject.username} coverPhoto`}
                    className="profileSummary__coverPhoto"
                  />
                ) : (
                  <div className="profileSummary__coverPhoto"></div>
                )}
                {postProfileObject && postProfileObject.profilePhotoURL ? (
                  <img
                    src={postProfileObject.profilePhotoURL}
                    alt={`${postProfileObject.username} profilePhoto`}
                    className="profileSummary__ProfilePhoto"
                  />
                ) : (
                  <FaUserCircle className="profileSummary__ProfilePhoto-none" />
                )}
              </div>
              <div className="post__profileSummary-main">
                <span className="post__profileSummary-name">
                  {loadingProfileDetails === true ? (
                    <Skeleton
                      highlightColor={"rgb(157, 157, 157)"}
                      height={15}
                      count={2}
                      width={100}
                    />
                  ) : (
                    nameFromObject(postProfileObject)
                  )}
                </span>
                <span className="post__profileSummary-summary">
                  {loadingProfileDetails === true ? (
                    <Skeleton
                      highlightColor={"rgb(157, 157, 157)"}
                      height={15}
                      count={2}
                      width={100}
                    />
                  ) : (
                    postProfileObject &&
                    postProfileObject.title &&
                    postProfileObject.title
                  )}
                </span>
                <button
                  type="button"
                  className="post__profileProfileSummary-profileLink"
                  onClick={() =>
                    history.push(`/in/${postProfileObject.username}`)
                  }
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
          <div className="postPage__section2">
            <FeedPost post={postObject} reactions={true} />

            {initCommentFetch === true && (
              <div className="postPage-comments">
                <div className="addComment">
                  <FaUserCircle className="addComment-pfp" />
                  <form className="addComment-form">
                    <input
                      type="text"
                      placeholder="Add a comment"
                      className="postPage-comment-input"
                      value={commentInput}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          await commentOnPost(e, { text: commentInput });
                        }
                      }}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                    {addingComment === true && (
                      <div className="addCommentModal">
                        <SyncLoader size={9} loading={true} color={"#0a66c2"} />
                      </div>
                    )}
                  </form>
                </div>

                <div className="postComments">
                  <div className="span">
                    <span className="commentFilterLabel">
                      <p
                        className="commentFilterValue"
                        onClick={() =>
                          setOpenCommentFilterMenu(!openCommentFilterMenu)
                        }
                        ref={commentFilterLabel}
                      >
                        Most relevant
                      </p>
                      <FaCaretDown className="commentFilterIcon" />
                    </span>
                    {openCommentFilterMenu === true && (
                      <span
                        className="commentFilters"
                        ref={commentFilterMenuRef}
                      >
                        <li className="commentFilter">Most Likes</li>
                        <li className="commentFilter">Latest</li>
                        <li className="commentFilter">Oldest</li>
                      </span>
                    )}
                  </div>
                  {initCommentFetch === true && (
                    <div className="post-comments">
                      {fullyNestedComments && fullyNestedComments.length > 0 ? (
                        fullyNestedComments.map((comment) => (
                          <>
                            <Comment comment={comment} />
                          </>
                        ))
                      ) : fullyNestedComments &&
                        fullyNestedComments.length === 0 ? (
                        <p>No comments on this post</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="postPage__section3">
            <div className="jobs-ad">
              <img src="/linkedin-jobs.jpg" alt="" className="jobs-adImage" />
            </div>
          </div>
        </div>
      </div>
    );
  } else if (loading === false && !postObject.authorId) {
    return (
      <div className="postPage">
        <h1>404 Error - Post does not Exist </h1>;
      </div>
    );
  }
};

export default PostPage;
