import { createSlice, current } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  comments: [],
  commentUsers: [],
  loadedComments: null,
  loadingPaths: [],
  commentsWithFullPath: [],
  commentsMap: [],
  commentsWithPath: [],
  addedPaths: null,
  fullyNestedComments: [],
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
    addCommentWithPath: (state, action) => {
      if (action.payload !== null) {
        state.commentsWithPath = action.payload;
      }
    },
    setAddedPaths: (state, action) => {
      state.addedPaths = action.payload;
    },
    setLoadingPaths: (state, action) => {
      state.loadingPaths = action.payload;
      if (action.payload) {
        state.commentsWithFullPath = [];
      }
    },
    resetPostPageSlice: (state, action) => {
      state.comments = [];
      state.commentUsers = [];
      state.loadedComments = null;
      state.commentsMap = [];
      state.commentsWithPath = [];
      state.addedPaths = null;
      state.commentsWithFullPath = [];
    },
    addPathToComment: (state, action) => {
      state.commentsWithFullPath = [
        ...state.commentsWithFullPath,
        action.payload,
      ];
    },
    setFullyNestedComments: (state, action) => {
      state.fullyNestedComments = action.payload;
    },
    sortComments: (state, action) => {
      console.log(action.payload);
      switch (action.payload) {
        case "oldest":
          state.fullyNestedComments = state.fullyNestedComments.sort((a, b) => {
            return (
              new Date(a.published.seconds * 1000) -
              new Date(b.published.seconds * 1000)
            );
          });
          break;
        case "latest":
          state.fullyNestedComments = state.fullyNestedComments.sort((a, b) => {
            return (
              new Date(b.published.seconds * 1000) -
              new Date(a.published.seconds * 1000)
            );
          });
      }
    },
  },
});

export const {
  setLoadingPaths,
  setFullyNestedComments,
  sortComments,
  setPostCommentChanges,
  addUserDetails,
  setCommentMap,
  setAddPostComment,
  setDeleteComment,
  handleModifiedComment,
  addPathToComment,
  setAddedPaths,
  addCommentWithPath,
  resetPostPageSlice,
} = postPage.actions;
export default postPage;
