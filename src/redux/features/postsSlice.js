import { createSlice, current } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";
import _ from "lodash";
const initialState = {
  posts: [],
  lastPost: null,
  sortedPosts: [],
  postsToPaginate: [],
  newPosts: [],
};

const removeItem = (arr, index) => {
  let newArray = [...arr];
  if (index !== -1) {
    newArray.splice(index, 1);
    return newArray;
  }
};
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setAddToPosts: (state, action) => {
      console.log(action.payload);
      console.log("DIFFERENCE IS");
      const tmpPosts = [...state.posts];
      const results = action.payload.filter(
        ({ postRefId: id1 }) =>
          !tmpPosts.some(({ postRefId: id2 }) => id2 === id1)
      );
      const deleted = tmpPosts.filter(
        ({ postRefId: id1 }) =>
          !action.payload.some(({ postRefId: id2 }) => id2 === id1)
      );
      console.log("NEW");
      console.log(results);
      console.log("DELETED");
      console.log(deleted);
      if (state.posts.length === 0) {
        state.postsToPaginate = [...results];
        //THIS IS WHAT THEU WILL SEE
      } else {
        state.newPosts = [...results, ...state.newPosts];
      }
      if (deleted.length > 0) {
        state.posts = state.posts.filter(
          (p) => !deleted.some((c) => c.postRefId === p.postRefId)
        );
        state.postsToPaginate = state.postsToPaginate.filter(
          (p) => !deleted.some((c) => c.postRefId === p.postRefId)
        );
      }
      state.posts = [...results, ...state.posts].sort((a, b) => {
        return (
          new Date(b.published.seconds * 1000) -
          new Date(a.published.seconds * 1000)
        );
      });
    },
    setPosts: (state, action) => {
      const received = [...action.payload];

      const currentPosts = [...state.posts];
      console.log(received);
      console.log(currentPosts);
      const results = received.filter(
        ({ postRefId: id1 }) =>
          !currentPosts.some(({ postRefId: id2 }) => id2 === id1)
      );
      console.log("NEW POSTS ARE");

      state.posts.unshift(...results);
    },
    setSortedPosts: (state, action) => {
      state.sortedPosts = action.payload;
    },
    setAddPostLikes: (state, action) => {
      const rO = state.posts.findIndex(
        (post) => post.postRefId === action.payload.postRefId
      );

      if (rO !== -1) {
        state.posts[rO].likes = action.payload.likes;
        state.posts[rO].users = action.payload.users;
      }
    },
    setRemoveFromPosts: (state, action) => {
      state.posts = state.posts.filter(
        (p) => p.postRefId !== action.payload.postRefId
      );
      state.postsToPaginate = state.postsToPaginate.filter(
        (p) => p.postRefId !== action.payload.postRefId
      );
    },
    setLastPost: (state, action) => {
      state.lastPost = [...state.lastPost, action.payload];
    },
    setPostsChanges: (state, action) => {
      switch (action.payload.type) {
        case "NEW_ITEMS":
          console.log("Adding new items to feed");
          let sortedPosts = [...action.payload.items, ...state.posts].sort(
            function (a, b) {
              return new Date(b.date) - new Date(a.date);
            }
          );
          state.posts = [...action.payload.items, ...state.posts];
        default:
          return state;
      }
    },
    setSortPostsOrder: (state, action) => {
      let r;
      if (action.payload === "latest") {
        console.log("LATESTTTTT");
        r = state.posts.sort(function (a, b) {
          return (
            new Date(b.published.seconds * 1000) -
            new Date(a.published.seconds * 1000)
          );
        });
      }
      if (action.payload === "oldest") {
        console.log("OLDESTTTTTT");
        r = state.posts.sort(function (a, b) {
          return (
            new Date(a.published.seconds * 1000) -
            new Date(b.published.seconds * 1000)
          );
        });
      }
      if (action.payload === "most_likes") {
        console.log("SUUEEE");
        r = state.posts.sort(function (a, b) {
          return b.likes - a.likes;
        });
      }
      console.log(r);
      state.posts = r;
      // state.posts= state.posts.sort
    },
    addReplies: (state, action) => {
      const tmpComment = action.payload[0];
      let tmpComments = current(state.comments);

      console.log(
        tmpComments.findIndex((c) => c.commentId === tmpComment.commentId)
      );
    },
  },
});

export const {
  setPosts,
  setSortedPosts,
  setPostsChanges,
  setAddPostLikes,
  setRemoveFromPosts,
  setPostsChange,
  setAddToPosts,
  setLastPost,

  setSortPostsOrder,
} = postsSlice.actions;
export default postsSlice;
