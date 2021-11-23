import React, { useState, useEffect } from "react";
import "./FeedPost.css";
import { useSelector, useDispatch } from "react-redux";
import {
  setRemoveFromPosts,
  setAddPostLikes,
} from "../redux/features/postsSlice";
import { BsDot } from "react-icons/bs";
import { Link, useHistory } from "react-router-dom";
import { IoMdGlobe } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { AiOutlineLike, AiOutlineComment, AiTwotoneLike } from "react-icons/ai";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  doc,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  arrayRemove,
  arrayUnion,
  getDocs,
  Timestamp,
  collectionGroup,
} from "firebase/firestore";
import { BsThreeDots } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import ReactionUser from "./ReactionUser";
import moment from "moment";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

const FeedPost = ({ post, idx, profileObj, organizationData, reactions }) => {
  const [showFullText, setShowFullText] = useState(false);
  const [loading, setLoading] = useState(null);
  const [comments, setComments] = useState(null);
  const [postUserObj, setPostUserObj] = useState({});
  const [showReactions, setShowReactions] = useState(true);
  const [postWithLikes, setPostWithLikes] = useState({});
  const [likes, setLikes] = useState(0);
  const [likesUsers, setLikesUsers] = useState([]);
  const [liked, setLiked] = useState(null);
  const [postId, setPostId] = useState("");
  const [showPostHeaderOptions, setShowPostHeaderOptions] = useState(false);
  const [imgsLoaded, setImgsLoaded] = useState(false);
  const { userObj } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const dispatch = useDispatch();
  const postProps = { ...post };
  TimeAgo.addDefaultLocale(en);
  const timeAgo = new TimeAgo("en-US");
  const history = useHistory();

  const commentsListener = () => {
    console.log("LISTENING FOR COMMENTS");
    const commentsQuery = query(
      collectionGroup(db, "comments"),
      where("parentPost", "==", post.postRefId)
    );
    const commentsSnap = onSnapshot(commentsQuery, (querySnapshot) => {
      let noComments = 0;
      querySnapshot.forEach((doc) => {
        noComments = noComments + 1;
      });
      console.log(noComments);
      setComments(noComments);
    });
  };
  useEffect(() => {
    // setLoading(true);

    const fetchProfileDetails = async () => {
      if (post.authorId) {
        // setLoading(true);
        const userQ = query(
          collection(db, "user"),
          where("username", "==", post.authorId)
        );

        const userSnap = await getDocs(userQ);

        userSnap.forEach((doc) => {
          setPostUserObj(doc.data());
          setPostId(doc.id);
        });
        await fetchLikes();
        setLoading(false);
      }
    };

    const fetchLikes = () => {
      try {
        const likes = query(
          collection(db, "likes"),
          where("postId", "==", post.postRefId)
        );
        const likeSnap = onSnapshot(likes, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setLikesUsers(doc.data().users);
            setLikes(doc.data().users.length);
            let t = {
              ...post,
              likes: doc.data().users.length,
              users: doc.data().users,
            };
            dispatch(setAddPostLikes(t));
            // setLiked(doc.data().user.some(name=>name===userOby.usenrma))
            setPostWithLikes(t);
          });
        });
      } catch (e) {
        console.log(e);
        console.log("error post item");
        console.log(post);
      }
    };

    fetchProfileDetails();
    return () => {
      setLikes(0);
      // setLikesUsers([]);
      // setPostUserObj({});
      setPostId(null);
    };
  }, [post.postRefId]);

  useEffect(() => {
    const loadImage = (image) => {
      return new Promise((resolve, reject) => {
        const loadImg = new Image();
        loadImg.src = image;
        // wait 2 seconds to simulate loading time
        loadImg.onload = () =>
          setTimeout(() => {
            resolve(image);
          }, 1000);

        loadImg.onerror = (err) => reject(err);
      });
    };

    if (post.images) {
      Promise.all(
        post.images && post.images.map((image, idx) => loadImage(image))
      )
        .then(() => {
          if (imgsLoaded === false) setImgsLoaded(true);
        })
        .catch((err) => console.log("Failed to load images", err));
    }

    return () => {
      setLikes(0);
      // setLiked(null);
      setLikesUsers([]);
    };
  }, [post]);

  useEffect(() => {
    commentsListener();
  }, [post]);

  const likePost = async () => {
    try {
      console.log("liking post");
      let likeAmount = liked === true ? -1 : 1;
      setLiked(liked ? false : true);
      setLikes((prevLikes) => prevLikes + likeAmount);
      let postLikeColID;
      console.log(post.postRefId);
      const likesQuery = query(
        collection(db, "likes"),
        where("postId", "==", post.postRefId)
      );

      const likesQuerySnap = await getDocs(likesQuery);
      likesQuerySnap.forEach((doc) => {
        postLikeColID = doc.id;
      });

      // const checkForUserLike = post.users.some((v) => v === userObj.username);
      // console.log(checkForUserLike);
      if (liked) {
        console.log("ABout to remove like");
        const unlikeAction = await updateDoc(doc(db, "likes", postLikeColID), {
          users: arrayRemove(userObj.username),
        }).then(() => {
          console.log("Unliked post with ID" + post.postRefId);
        });
      } else {
        const likeAction = await updateDoc(doc(db, "likes", postLikeColID), {
          users: arrayUnion(userObj.username),
        });
        console.log("likedPost");
      }
    } catch (e) {
      console.log("error liking post");
      console.log(e);
    }
  };

  const generateLikesSentence = (likesUsers) => {
    //array length,  if youre in the array
    if (
      likesUsers.length === 1 &&
      !likesUsers.some((u) => u === userObj.username)
    ) {
      return `${likesUsers[0]} likes this`;
    } else if (
      likesUsers.length === 1 &&
      likesUsers.some((u) => u === userObj.username)
    ) {
      return `You like this`;
    } else if (
      likesUsers.length === 2 &&
      likesUsers.some((u) => u === userObj.username)
    ) {
      return `You and ${
        likesUsers.filter((u) => u !== userObj.username)[0]
      } like this`;
    } else if (
      likesUsers.length > 2 &&
      likesUsers.some((u) => u === userObj.username)
    ) {
      return `You and ${likesUsers.length - 1} others like this`;
    } else {
      return `users like this`;
    }
  };
  const handleDeletePost = async () => {
    try {
      setShowPostHeaderOptions(false);
      let pdi;
      let pcdi;
      const followsPosts = query(
        collection(db, "follows"),
        where("username", "==", userObj.username)
      );
      const postsDoc = await getDocs(followsPosts);
      postsDoc.forEach((doc) => {
        console.log(doc.data());
        pdi = doc.id;
        console.log(pdi);
      });

      console.log("this is pdi");
      console.log(pdi);

      const postDocRef = doc(db, "follows", pdi);
      const { likes, users, ...x } = post;
      await updateDoc(postDocRef, {
        recentPosts: arrayRemove(x),
      }).then(() => {
        console.log("deleted from follows");
        console.log(post.postRefId);
        dispatch(setRemoveFromPosts(post));
      });

      const postDel = await deleteDoc(doc(db, "posts", post.postRefId));
      const likesDoc = query(
        collection(db, "likes"),
        where("postId", "==", post.postRefId)
      );
      const likesDocSnap = await getDocs(likesDoc);

      const deleteFromLikes = async () => {
        likesDocSnap.forEach(async (doc) => {
          await deleteDoc(doc, "likes", doc.id);
        });
      };
      // dispatch(setRemoveFromPosts(idx));
    } catch (e) {
      console.log(e);
      console.log("ERROR DELETING");
    }
  };
  const addCommentsArray = async (pID) => {
    const documentReference = doc(db, "posts", pID);
    await updateDoc(documentReference, {
      comments: [],
    });
  };

  useEffect(() => {
    console.log("POST USERS ARE:");
    console.log(post);
    setLiked(post.users && post.users.some((v) => v === userObj.username));
    return () => {
      setLiked(null);
    };
  }, [post]);

  if (
    (post.postType === "text" && post.postText.length > 0) ||
    (post.postType === "images" && post.images.length > 0)
  ) {
    return (
      <>
        {postUserObj.username && (
          <div className="feedPost">
            <div className="feedPost__header">
              {userObj.username === post.authorId && (
                <BsThreeDots
                  className="headerOptions-button"
                  onClick={() =>
                    setShowPostHeaderOptions(!showPostHeaderOptions)
                  }
                />
              )}
              {showPostHeaderOptions === true &&
                userObj.username === post.authorId && (
                  <ul className="feedPost__headerOptions">
                    <li onClick={handleDeletePost}>
                      <FaTrashAlt className="feedPost__headerOptions-delete" />
                      <p> Delete post</p>
                    </li>
                  </ul>
                )}
              <img
                src={
                  postUserObj.profilePhotoURL
                    ? postUserObj.profilePhotoURL
                    : "https://cdn.landesa.org/wp-content/uploads/default-user-image.png"
                }
                alt={postUserObj.username}
              />

              <span className="feedPost__userDetails">
                <Link to={`/in/${postUserObj.username}`}>
                  <p className="feedPost__userDetails-name ">
                    {`${postUserObj.name.firstName} ${postUserObj.name.lastName}`}
                  </p>
                </Link>
                {postUserObj.title && (
                  <p className="feedPost__userDetails-userSummary">
                    {postUserObj.title}
                    {(postUserObj.organizationName &&
                      ` at ${
                        postUserObj.organizationName ||
                        (organizationData.name && organizationData.name) ||
                        null
                      }`) ||
                      null}
                  </p>
                )}
                <p className="feedPost__userDetails-postTime">
                  {timeAgo.format(
                    new Date(post.published.seconds * 1000),
                    "mini"
                  )}
                  <BsDot className="postTime-dot" />
                  <IoMdGlobe
                    className="postTime-globe"
                    style={{
                      marginLeft: "0px",
                      color: "rgb(77, 77, 77)",
                      fontSize: "1.7em",
                    }}
                  />
                </p>
              </span>
            </div>
            <div className="feedPost__body">
              {post.postText && (
                <div className="feedPost__body-text">
                  <p
                    className={
                      showFullText
                        ? "feedPost__body-text-contentFull"
                        : "feedPost__body-text-content"
                    }
                  >
                    {post.postText}
                  </p>
                  <p
                    className="feedPost__body-seeMore"
                    onClick={() => history.push(`/posts/${post.postRefId}`)}
                  >
                    {!showFullText ? "...see more" : "show less"}
                  </p>
                </div>
              )}
              {post.images && (
                <>
                  {post.images.length > 1 && (
                    <p className="feedPost__media-summary">
                      {post.images.length} {post.images && "images"}
                      {post.type} in this post
                    </p>
                  )}
                  <div className="feedPost__body-media">
                    {imgsLoaded ? (
                      <Carousel>
                        {post.images.map((image, key) => (
                          <img src={image} alt="Post Media" key={key} />
                        ))}
                      </Carousel>
                    ) : (
                      <Skeleton width={400} height={150} />
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="feedPost__engagements">
              <div className="feedPost__engagements-likes">
                <AiTwotoneLike className="feedPost__likes" />
                <p className="feedPost__engagements-summary">
                  {postWithLikes.likes && postWithLikes.likes}
                </p>
                {postWithLikes.users && postWithLikes.users.length > 0 && (
                  <p className="feedPost__engagements-summary">
                    {generateLikesSentence(postWithLikes.users)}
                  </p>
                )}
              </div>
              <p className="postCommentsAmount">{comments ?? 0} comments</p>
            </div>
            {reactions === true && (
              <div className="feedPost-postReactions">
                <p className="reactions-title">Reactions</p>
                <div className="reactions-container">
                  {postWithLikes.users &&
                    postWithLikes.users.map((l) => <ReactionUser user={l} />)}
                </div>
              </div>
            )}
            <div className="feedPost__actions">
              <button
                className={
                  postWithLikes &&
                  postWithLikes.users &&
                  postWithLikes.users.some((u) => u === userObj.username)
                    ? "feedPost__action-liked"
                    : "feedPost__action"
                }
                onClick={async () => await likePost()}
              >
                <AiOutlineLike
                  className={
                    liked ? "feedPost__liked" : "feedPost__action-icon"
                  }
                />
                <p>
                  {postWithLikes &&
                  postWithLikes.users &&
                  postWithLikes.users.some((u) => u === userObj.username)
                    ? "Liked"
                    : "Like"}
                </p>
              </button>
              <button className="feedPost__action">
                <AiOutlineComment className="feedPost__action-icon" />
                <p>Comment</p>
              </button>
            </div>
          </div>
        )}
      </>
    );
  } else {
    return null;
  }
};
export default FeedPost;
