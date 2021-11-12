import React, { useState, useEffect } from "react";
import { auth, rtDB, db } from "../firebase/firebaseConfig";
import {
  query,
  getDocs,
  collectionGroup,
  where,
  onSnapshot,
} from "firebase/firestore";
import Comment from "../components/Comment";
const TestPage = () => {
  const [testComments, setTestComments] = useState([]);
  const [fullyNestedComments, setFullyNestedComments] = useState([]);
  const filterFunction = (commentsArr, condition) => {
    return filterFunction(commentsArr.filter(condition), condition);
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
      commentMap[comment.commentId] = comment;
    });
    commentsArr.forEach((comment) => {
      if (comment.parentComment !== null) {
        // commentMap[comment.parentComment]["children"].push(comment);
        const parent = commentMap[comment.parentComment];
        (parent.children = parent.children || []).push(comment);
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
        });
      }
    });
    return nestedComments;
  };

  const fetchComments = () => {
    console.log("SIUU");
    const postCommentQuery = query(
      collectionGroup(db, "comments"),
      where("parentPost", "==", "i1uJF35D0tzz5dB29fbm")
    );
    const postCommentsSnap = onSnapshot(postCommentQuery, (querySnapshot) => {
      const tmpComments = [];
      querySnapshot.forEach((doc) => {
        console.log("FETCHED TEST COMMENT");
        console.log(doc.data());
        tmpComments.push({ ...doc.data(), commentId: doc.id });
      });
      console.log("ALL FETCHED COMMENTS");
      console.log(tmpComments);
      setTestComments(tmpComments);
    });
  };

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    const g = getCommentsWithChildren(testComments);
    const fullNestComments = getBaseCommentsWithChildren(g);
    setFullyNestedComments(fullNestComments);
    console.log(fullNestComments);
  }, [testComments]);

  useEffect(() => {
    console.log(fullyNestedComments);
  }, [fullyNestedComments]);
  const nestedComments = (comment) =>
    (comment.children || []).map((c) => <Comment comment={comment} />);

  return (
    <div
      style={{
        marginTop: "100px",
        height: "600px",
        width: "100vw",
        backgroundColor: "aqua",
        textAlign: "left",
      }}
    >
      {fullyNestedComments.map((c) => (
        <Comment comment={c} />
      ))}
    </div>
  );
};

export default TestPage;
