import React from "react";
import "./AddToFeedItem.css";
import { AiOutlinePlus } from "react-icons/ai";
const AddToFeedItem = ({ item }) => {
  return (
    <div className="addToFeed__item">
      <img src={item.imageUrl} alt="aaaa" />
      <div className="addToFeed__details">
        <p className="addToFeed__name">{item.name}</p>
        <p className="addToFeed__summary">{item.summary}</p>
        <button className="addToFeed__follow">
          <AiOutlinePlus className="addToFeed__followIcon" /> Follow
        </button>
      </div>
    </div>
  );
};

export default AddToFeedItem;
