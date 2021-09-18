import React, { useState, useEffect } from "react";
import "./FeedPost.css";
import { IoMdGlobe } from "react-icons/io";
import { AiOutlineLike, AiOutlineComment, AiTwotoneLike } from "react-icons/ai";
import { CgComment } from "react-icons/cg";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, doc, getDocs } from "firebase/firestore";
import Skeleton from "react-loading-skeleton";
const FeedPost = ({ post }) => {
  const [showFullText, setShowFullText] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postUserObj, setPostUserObj] = useState({});

  useEffect(() => {
    console.log(post);
    const fetchProfileDetails = async () => {
      setLoading(true);
      const userQ = query(
        collection(db, "user"),
        where("username", "==", post.authorId)
      );

      const userSnap = await getDocs(userQ);
      let y;
      userSnap.forEach((doc) => {
        console.log("Doc id of users follow document" + doc.id);
        setPostUserObj(doc.data());
      });
      setLoading(false);
    };
    fetchProfileDetails();
  }, []);
  // useEffect(() => {
  //   console.log("POST USER OBJECT CHANGED");
  //   console.log(postUserObj);
  // }, [postUserObj]);
  return (
    <>
      {loading === false ? (
        <div className="feedPost">
          <div className="feedPost__header">
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
                {postUserObj.username}
              </p>
              <p className="feedPost__userDetails-userSummary">
                #1 New York Times Selling Author
              </p>
              <p className="feedPost__userDetails-postTime">
                1d
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
            {post.postTex && (
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
            <div className="feedPost__engagements">
              <AiTwotoneLike className="feedPost__likes" />
            </div>
            {post.images && (
              <div className="feedPost__body-media">
                {post.images.map((image) => (
                  <img src={image} alt="Post Media" />
                ))}
              </div>
            )}
          </div>
          <div className="feedPost__actions">
            <button className="feedPost__action">
              <AiOutlineLike className="feedPost__action-icon" />
              <p>Like</p>
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
