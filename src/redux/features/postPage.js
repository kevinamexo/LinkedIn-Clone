import { createSlice, current } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  comments: [],
  commentUsers: [],
  loadedComments: null,
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
    addUserDetails: (state, action) => {
      const tmpUser = action.payload;
      console.log(tmpUser);
      const tmpUsers = [...state.commentUsers];
      const userExists = tmpUsers.some(
        (user) => (user.authorId = tmpUser.authorId)
      );
      if (userExists === false) {
        state.commentUsers = [...state.commentUsers, tmpUser];
      }
    },
    setDeleteComment: (state, action) => {
      const tmpItemToDelete = action.payload;
      console.log("RECEIVED");
      console.log(console.log(action.payload));
      const tmpComments = [...state.comments];
      console.log("COMMENTS");
      state.comments = tmpComments.filter(
        (obj) => JSON.stringify(obj) !== JSON.stringify(tmpItemToDelete)
      );
    },
  },
});

export const {
  setPostCommentChanges,
  addUserDetails,
  setAddPostComment,
  setDeleteComment,
} = postPage.actions;
export default postPage;
