import React, { useState, useEffect } from "react";
import "./FeedPost.css";
import { useSelector } from "react-redux";
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
  getDocs,
  Timestamp,
  toDate,
} from "firebase/firestore";
import { BsThreeDots } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import moment from "moment";
const FeedPost = ({
  post,
  idx,
  profileObj,
  organizationData,
  feedPosts,
  setFeedPosts,
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postUserObj, setPostUserObj] = useState({});
  const [likes, setLikes] = useState(23);
  const [liked, setLiked] = useState(null);
  const [postId, setPostId] = useState("");
  const [showPostHeaderOptions, setShowPostHeaderOptions] = useState(false);
  const { userObj } = useSelector((state) => state.user);

  useEffect(() => {
    let postDate = post.published ? moment(post.published.seconds) : null;
    let dateNow = moment();
    let username =
      profileObj && profileObj.username ? profileObj.username : post.authorId;
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
        setLoading(false);
      }
    };
    fetchProfileDetails();
  }, []);

  const likePost = async () => {
    try {
      if (liked === false || liked === null) {
        setLikes((prevLikes) => prevLikes + 1);
        setLiked(true);
        // const postRef=
      } else if (liked === true) {
        setLikes((prevLikes) => prevLikes - 1);
        setLiked(false);
      }
    } catch (e) {
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
        pdi = doc.id;
        pcdi = doc.data().postRefId;
      });
      console.log("deleted from follows");

      const postDocRef = doc(db, "follows", pdi);
      const querySnapshot2 = await updateDoc(postDocRef, {
        recentPosts: arrayRemove(post),
      });

      const postsColRef = doc(db, "posts", pdi);
      await deleteDoc(postsColRef).then(() => {
        deleteByIndex(idx);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const deleteByIndex = (index) => {
    const newFeedPosts = [...feedPosts];
    newFeedPosts.splice(index, 1);
    setFeedPosts((state) => newFeedPosts);
    console.log(feedPosts);
  };

  return (
    <>
      {loading === false ? (
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
                  : "https://media-exp1.licdn.com/dms/image/C5603AQGEdRXt-tOAbw/profile-displayphoto-shrink_100_100/0/1588621541709?e=1634774400&v=beta&t=IJni8xOR-N9zfH5on7sn0jQ7ClkGZorjJXnxyUYBAdU"
              }
              alt={postUserObj.username}
            />

            <span className="feedPost__userDetails">
              <p className="feedPost__userDetails-name ">
                {`${postUserObj.name.firstName} ${postUserObj.name.lastName}`}
              </p>
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
                {}
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
              <div className="feedPost__body-media">
                {post.images.map((image) => (
                  <img src={image} alt="Post Media" />
                ))}
              </div>
            )}
          </div>
          <div className="feedPost__engagements">
            <AiTwotoneLike className="feedPost__likes" />
            <p>{likes}</p>
          </div>
          <div className="feedPost__actions">
            <button
              className={liked ? "feedPost__action-liked" : "feedPost__action"}
              onClick={likePost}
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
