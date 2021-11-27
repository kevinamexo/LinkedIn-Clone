import { createSlice, current } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  comments: [],
  commentUsers: [],
  loadedComments: null,
  commentsMap: [],
};

const postPage = createSlice({
  name: "postPage",
  initialState,
  reducers: {
    setPostCommentChanges: (state, action) => {
      console.log("receivedComment");
      let tmpComments = [...action.payload];
      let tmpStateComment = [...state.comments];
      console.log(current(state.comments));
      const newComment = _.difference(tmpComments, tmpStateComment);
      console.log("DIFFERENCE IS");
      console.log(newComment);
      state.comments = [...state.comments, ...newComment];
    },
    setAddPostComment: (state, action) => {
      state.comments = [...state.comments, action.payload];
      state.loadedComments = true;
    },
    setCommentMap: (state, action) => {
      state.commentsMap = action.payload.allComments;
    },
    handleModifiedComment: (state, action) => {
      console.log("MODIFIED COMMENT");
      console.log(action.payload);
      const tmpComments = [...state.comments];
      console.log(tmpComments);
      console.log(action.payload.commentId);

      const modifiedCommentIdx = tmpComments.findIndex(
        (comment) => comment.commentId === action.payload.commentId
      );
      if (modifiedCommentIdx !== -1) {
        console.log(current(state.comments[modifiedCommentIdx]));
        console.log(action.payload);

        state.comments[modifiedCommentIdx] = action.payload;
        console.log(state.comments);
      }
    },
    addUserDetails: (state, action) => {
      const tmpUser = action.payload;
      console.log(tmpUser);
      const tmpUsers = current([...state.commentUsers]);
      const userExists = tmpUsers.some(
        (user) => (user.authorId = tmpUser.authorId)
      );
      if (userExists === false) {
        state.commentUsers = [...state.commentUsers, tmpUser];
      }
    },
    setDeleteComment: (state, action) => {
      const tmpItemToDelete = { ...action.payload };
      console.log("RECEIVED");
      console.log(action.payload);
      const tmpComments = [...state.comments];
      console.log("COMMENTS");
      state.comments = state.comments.filter((obj) => {
        const { commentId, children, path, ...x } = obj;
        console.log(JSON.stringify(action.payload));
        console.log(JSON.stringify(x));

        return _.isEqual(x, action.payload) === false;
      });
    },
  },
});

export const {
  setPostCommentChanges,
  addUserDetails,
  setCommentMap,
  setAddPostComment,
  setDeleteComment,
  handleModifiedComment,
} = postPage.actions;
export default postPage;
