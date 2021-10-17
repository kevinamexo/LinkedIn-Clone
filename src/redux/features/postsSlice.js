import { createSlice, current } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";
import _ from "lodash";
const initialState = {
  posts: [],
  lastPost: null,
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
    setPosts: (state, action) => {
      state.posts = action.payload.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    },
    setAddToPosts: (state, action) => {
      state.posts = [...action.payload, ...state.posts];
    },
    setRemoveFromPosts: (state, action) => {
      console.log(
        "removed" + JSON.stringify(state.posts.slice(action.payload, 1))
      );
      state.posts = removeItem(state.posts, action.payload);
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
          return new Date(b.published) - new Date(a.published);
        });
      }
      if (action.payload === "oldest") {
        console.log("OLDESTTTTTT");
        r = state.posts.sort(function (a, b) {
          return new Date(a.published) - new Date(b.published);
        });
      }
      console.log("SUUEEE");
      console.log(current(r));
      state.posts = r;
      // state.posts= state.posts.sort
    },
  },
});

export const {
  setPosts,
  setPostsChanges,
  setRemoveFromPosts,
  setPostsChange,
  setAddToPosts,
  setLastPost,
  setSortPostsOrder,
} = postsSlice.actions;
export default postsSlice;
