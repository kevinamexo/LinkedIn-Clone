import React, { useState } from "react";
import "./FeedPost.css";
import { IoMdGlobe } from "react-icons/io";
import { AiOutlineLike, AiOutlineComment, AiTwotoneLike } from "react-icons/ai";
import { CgComment } from "react-icons/cg";
const FeedPost = ({ post }) => {
  const [showFullText, setShowFullText] = useState(false);
  return (
    <div className="feedPost">
      <div className="feedPost__header">
        <img
          src="https://media-exp1.licdn.com/dms/image/C5603AQGEdRXt-tOAbw/profile-displayphoto-shrink_100_100/0/1588621541709?e=1634774400&v=beta&t=IJni8xOR-N9zfH5on7sn0jQ7ClkGZorjJXnxyUYBAdU"
          alt="Tony Robins"
        />
        <span className="feedPost__userDetails">
          <p className="feedPost__userDetails-name ">Tony Robbins</p>
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
        <div className="feedPost__engagements">
          <AiTwotoneLike className="feedPost__likes" />
        </div>
        {/* <div className="feedPost__body-media">
          <img
            src="https://www.techrepublic.com/a/hub/i/r/2021/05/04/1d1b6fe0-daef-4c62-a5d7-f759b0efd637/resize/1200x/2895ab36265228ff9a0b1b9ea7d39d80/cryptocurrency-market.jpg"
            alt="Post Media"
          />
        </div> */}
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
  );
};

export default FeedPost;
