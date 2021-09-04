import React from "react";
import "./RSidebar.css";
import AddToFeedItem from "./AddToFeedItem";

const addToFeedItems = [
  {
    name: "Tony Robbins",
    imageUrl:
      "https://media-exp1.licdn.com/dms/image/C5603AQGEdRXt-tOAbw/profile-displayphoto-shrink_100_100/0/1588621541709?e=1634774400&v=beta&t=IJni8xOR-N9zfH5on7sn0jQ7ClkGZorjJXnxyUYBAdU",
    summary: "#1 New York Times best-selling author",
    verified: true,
  },
  {
    name: "Tony Robbins",
    imageUrl:
      "https://media-exp1.licdn.com/dms/image/C5603AQGEdRXt-tOAbw/profile-displayphoto-shrink_100_100/0/1588621541709?e=1634774400&v=beta&t=IJni8xOR-N9zfH5on7sn0jQ7ClkGZorjJXnxyUYBAdU",
    summary: "#1 New York Times best-selling author",
    verified: true,
  },
  {
    name: "Tony Robbins",
    imageUrl:
      "https://media-exp1.licdn.com/dms/image/C5603AQGEdRXt-tOAbw/profile-displayphoto-shrink_100_100/0/1588621541709?e=1634774400&v=beta&t=IJni8xOR-N9zfH5on7sn0jQ7ClkGZorjJXnxyUYBAdU",
    summary: "#1 New York Times best-selling author",
    verified: true,
  },
];
const RSidebar = () => {
  return (
    <div className="RSidebar">
      <div className="addToFeed">
        <span className="addToFeed__header">
          <p>Add to your feed</p>
          <p>+</p>
        </span>
        {addToFeedItems &&
          addToFeedItems.map((item) => <AddToFeedItem item={item} />)}
      </div>
    </div>
  );
};

export default RSidebar;
