import React, { useState, useEffect } from "react";
import "./FeedPost.css";
import { useSelector, useDispatch } from "react-redux";
import { setPosts, setRemoveFromPosts } from "../redux/features/postsSlice";
import { Link } from "react-router-dom";
import { IoMdGlobe } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { AiOutlineLike, AiOutlineComment, AiTwotoneLike } from "react-icons/ai";
import { CgComment } from "react-icons/cg";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  arrayRemove,
  arrayUnion,
  getDocs,
  Timestamp,
  toDate,
} from "firebase/firestore";
import { BsThreeDots } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import moment from "moment";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { set } from "react-hook-form";
const FeedPost = ({ post, idx, profileObj, organizationData }) => {
  const [showFullText, setShowFullText] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postUserObj, setPostUserObj] = useState({});
  const [likes, setLikes] = useState(0);
  const [likesUsers, setLikesUsers] = useState([]);
  const [liked, setLiked] = useState(null);
  const [postId, setPostId] = useState("");
  const [showPostHeaderOptions, setShowPostHeaderOptions] = useState(false);
  const [imgsLoaded, setImgsLoaded] = useState(false);
  const { userObj } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const dispatch = useDispatch();

  let postRefId;

  useEffect(() => {
    setLoading(true);
    console.log("CONSOLE.LOG POST`");
    console.log(post);
    postRefId = post.postRefId;
    console.log("postRefId");
    console.log(postRefId);
    let postDate = post.published ? moment(post.published.seconds) : null;
    let dateNow = moment();
    let username = post.authorId;
    console.log(postDate);
    // console.log(dateNow);
    // console.log(dateNow.diff(postDate, "years"));
    const fetchProfileDetails = async () => {
      if (profileObj || post.authorId) {
        setLoading(true);
        const userQ = query(
          collection(db, "user"),
          where("username", "==", username)
        );

        const userSnap = await getDocs(userQ);
        let y;
        userSnap.forEach((doc) => {
          console.log("Doc id of users follow document" + doc.id);
          setPostUserObj(doc.data());
          setPostId(doc.id);
        });
        await fetchLikes();
        setLoading(false);
      }
    };

    const fetchLikes = async () => {
      try {
        const likes = query(
          collection(db, "likes"),
          where("postId", "==", post.postRefId)
        );
        const likesSnap = await getDocs(likes);
        likesSnap.forEach((doc) => {
          setLikesUsers(doc.data().users);
          setLikes(doc.data().users.length);
        });
      } catch (e) {
        console.log(e);
      }
    };

    fetchProfileDetails();
    return () => {
      setLikes(0);
      setLiked(false);
      setLikesUsers([]);
      setPostUserObj({});
      username = "";
      let postRefId = "";
    };
  }, []);

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
      setLiked(null);
      setLikesUsers([]);
    };
  }, [posts]);

  useEffect(() => {
    if (post.likes === 0) {
      setLikes(0);
      setLiked(0);
    }
  }, [posts]);
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
      const checkForUserLike = likesUsers.some((v) => v === userObj.username);
      console.log(checkForUserLike);
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

  const handleDeletePost = async () => {
    try {
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
      const querySnapshot2 = await updateDoc(postDocRef, {
        recentPosts: arrayRemove(post),
      });
      console.log("deleted from follows");
      console.log(post.postRefId);

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
      dispatch(setRemoveFromPosts(idx));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    console.log(likesUsers);
    const checkingLike = likesUsers.some((v) => v === userObj.username);

    if (post.likes !== 0 && checkingLike === true) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [likesUsers]);

  return (
    <>
      {loading === false && postUserObj ? (
        <div className="feedPost">
          <div className="feedPost__header">
            {userObj.username === post.authorId && (
              <BsThreeDots
                className="headerOptions-button"
                onClick={() => setShowPostHeaderOptions(!showPostHeaderOptions)}
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
                  {` at ${
                    postUserObj.organizationName ||
                    (organizationData.name && organizationData.name)
                  }` || null}
                </p>
              )}
              <p className="feedPost__userDetails-postTime">
                {/* {post.likes || 0} */}
                <IoMdGlobe
                  style={{
                    marginLeft: "5px",
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
                  onClick={() => setShowFullText(!showFullText)}
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
            <AiTwotoneLike className="feedPost__likes" />
            <p>{likes}</p>
          </div>
          <div className="feedPost__actions">
            <button
              className={liked ? "feedPost__action-liked" : "feedPost__action"}
              onClick={async () => await likePost()}
            >
              <AiOutlineLike
                className={liked ? "feedPost__liked" : "feedPost__action-icon"}
              />
              <p>{liked ? "Liked" : "Like"}</p>
            </button>
            <button className="feedPost__action">
              <AiOutlineComment className="feedPost__action-icon" />
              <p>Comment</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="feedPost">
          <div className="feedPost__header">
            <Skeleton circle={true} height={48} width={48} />
            <span
              style={{ width: "100%", marginTop: "4px", marginLeft: "10px" }}
            >
              <Skeleton count={2} height={10} />
            </span>
          </div>
          <div className="postContent">
            <Skeleton count={3} />
          </div>
        </div>
      )}
    </>
  );
};

export default FeedPost;
