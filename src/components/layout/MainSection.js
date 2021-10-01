import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { BsCalendar } from "react-icons/bs";
import { MdPhoto } from "react-icons/md";
import { RiArticleLine, RiVideoFill } from "react-icons/ri";
import CreatePostModal from "../modals/CreatePostModal";
import ContactInfoModal from "../modals/ContactInfoModal";
import "./MainSection.css";
import { useSelector, useDispatch } from "react-redux";

import { setPosts, setAddToPosts } from "../../redux/features/postsSlice";
import FeedPost from "../FeedPost";
import UploadModal from "../modals/UploadModal";
import { db } from "../../firebase/firebaseConfig";
import {
  where,
  limit,
  orderBy,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import {
  setShowCreatePostModal,
  setCloseCreatePostModal,
  setShowContactCardModal,
  setShowUploadImage,
  setShowUploadVideo,
} from "../../redux/features/modalsSlice";

import InfiniteScroll from "react-infinite-scroll-component";
import { set } from "react-hook-form";

const MainSection = () => {
  const [postInput, setPostInput] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(null);

  const dispatch = useDispatch();
  const { posts, lastPost } = useSelector((state) => state.posts);
  const { userObj } = useSelector((state) => state.user);
  const {
    showUploadImage,
    showContactCardModal,
    showUploadVideo,
    showCreatePostModal,
  } = useSelector((state) => state.modals);
  const [feedPosts, setFeedPosts] = useState([]);
  const [uploadType, setUploadType] = useState(null);

  //GET USER FEED, LIMIT TO 5 POSTS
  let lastPublished = null;

  const getFeed = async () => {
    let latestPosts = [];
    let followedUsers;
    try {
      setLoadingPosts(true);
      const postQuery =
        lastPublished !== null
          ? query(
              collection(db, "follows"),
              where("users", "array-contains", userObj.username),
              where("lastPost", ">=", lastPublished),
              orderBy("lastPost", "desc"),
              limit(10)
            )
          : query(
              collection(db, "follows"),
              where("users", "array-contains", userObj.username),
              orderBy("lastPost", "desc"),
              limit(10)
            );

      // const fetchedPosts = onSnapshot(followedUsers, (querySnapshot) => {
      //   let postsWithDate = [];
      //   console.log("NEW SNAPSHOT");
      //   querySnapshot.forEach((doc) => {
      //     console.log("RAW RECENT POSTS");
      //     console.log(doc.data().recentPosts);
      //     let postTimes = [];
      //     latestPosts = [...latestPosts, ...doc.data().recentPosts];
      //     console.log("woo");
      //     console.log(latestPosts);
      //     latestPosts.forEach((p) => {
      //       postsWithDate = [
      //         ...postsWithDate,
      //         { ...p, published: p.published.toDate() },
      //       ];
      //     });
      //     // const sortedPosts = latestPosts.sort((a, b) => b.published);
      //     dispatch(setPosts(postsWithDate));
      //   });
      // });
      const fetchedPosts = onSnapshot(postQuery, (querySnapshot) => {
        let unsortedPosts = [];
        let postsWithDate = [];
        console.log("NEW SNAPSHOT");
        querySnapshot.forEach((doc) => {
          console.log(doc.data().recentPosts);
          unsortedPosts = [...unsortedPosts, ...doc.data().recentPosts];
          // setFeedPosts((prev) => [...prev, ...doc.data().recentPosts]);
        });

        unsortedPosts.forEach((p) => {
          postsWithDate = [
            ...postsWithDate,
            { ...p, published: p.published.toDate() },
          ];
        });
        const sortedPosts = postsWithDate.sort((a, b) => {
          let c = new Date(a.published);
          let d = new Date(b.published);
          return d - c;
        });

        let g = sortedPosts.filter((p) => p.published > lastPublished);

        console.log("SORTED FETCHED");

        lastPublished
          ? setFeedPosts((prev) => [...g, ...prev])
          : setFeedPosts(sortedPosts);

        lastPublished = sortedPosts[0].published;
        console.log(sortedPosts[0].published);

        // console.log("CONCAT SNAPSHOTS");s
        // console.log(postsSample);
        // dispatch(setPosts(postsSample));
      });
      setLoadingPosts(false);
    } catch (e) {
      console.log(e);
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    console.log(lastPublished);
  }, [lastPublished]);

  useEffect(() => {
    console.log("feedPosts");
    console.log(feedPosts);
  }, [feedPosts]);

  useEffect(() => {
    getFeed();
    return () => {
      setLoadingPosts(null);
      let followedUsers;
      // dispatch(setPosts([]));
      // let postsSample = [];
    };
  }, []);
  useEffect(() => {
    console.log(posts);
  }, [posts]);
  return (
    <div className="mainSection">
      <div className="mainSection__post">
        <div className="mainSection__postInput">
          <FaUserCircle className="mainSection__profilePic" />
          <div
            className="mainSection__startPost"
            onClick={() => dispatch(setShowCreatePostModal())}
          >
            Start a post
          </div>
        </div>
        <div className="mainSection__postTypes">
          <span
            className="mainSection__postType"
            onClick={() => {
              setUploadType("images");
              dispatch(setShowUploadImage());
            }}
          >
            <MdPhoto className="postType-photoIcon" />
            <p className="postType-label">Photo</p>
          </span>
          <span
            className="mainSection__postType"
            onClick={() => {
              setUploadType("video");
              dispatch(setShowUploadVideo());
            }}
          >
            <RiVideoFill className="postType-vidIcon" />
            <p className="postType-label">Video</p>
          </span>
          <span className="mainSection__postType">
            <BsCalendar className="postType-eventIcon" />
            <p className="postType-label">Event</p>
          </span>
          <span className="mainSection__postType">
            <RiArticleLine className="postType-articleIcon" />
            <p className="postType-label">Write article</p>
          </span>
        </div>
      </div>
      <div className="mainSection__feed">
        {feedPosts &&
          feedPosts.map((post, idx) => <FeedPost post={post} idx={idx} />)}
        {feedPosts.length === 0 && loadingPosts === false && (
          <p className="no-posts">No posts in your feed</p>
        )}
      </div>
      {showCreatePostModal && (
        <CreatePostModal
          setShowCreatePostModal={setShowCreatePostModal}
          setFeedPosts={setFeedPosts}
          feedPosts={posts}
        />
      )}
      {showUploadImage && uploadType === "images" && (
        <UploadModal
          type="images"
          setFeedPosts={setFeedPosts}
          feedPosts={posts}
        />
      )}
      {showUploadVideo && uploadType === "video" && (
        <UploadModal type="video" />
      )}
      {showContactCardModal && <ContactInfoModal />}
    </div>
  );
};

export default MainSection;
