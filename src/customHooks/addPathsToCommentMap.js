import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNewPath } from ".././redux/features/postPage/";

const useAddCommentPaths = (commentObj) => {
  const dispatch = useDispatch();
  const [repliesAmount, setRepliesAmount] = useState(0);
  const { commentsMap } = useSelector((state) => state.postPage);
  function getPath(commentObj, pp = "") {
    let newPath;
    if (pp.length > 0) {
      newPath = pp + "/" + commentObj.commentId;
    } else {
      newPath = commentObj.commentId;
    }
    dispatch(addNewPath({ comment: commentObj, newPath: newPath }));
    commentObj.newPath = newPath;

    if (commentObj.children.length > 0) {
      commentObj.children.forEach((gc) => {
        getPath(gc, newPath);
      });
    }
  }

  useEffect(() => {
    const empty = "";
    commentsMap.forEach((c) => {
      getPath(c, empty);
    });
  }, [commentsMap]);

  return repliesAmount;
};

export default useAddCommentPaths;
