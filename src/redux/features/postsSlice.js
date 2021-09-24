import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

const initialState = {
  posts: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setAddToPosts: (state, action) => {
      state.posts = [action.payload, ...state.posts];
    },
    setRemoveFromPosts: (state, action) => {
      state.posts.slice(action.payload, 1);
    },
  },
});

export const { setPosts, setRemoveFromPosts, setAddToPosts } =
  postsSlice.actions;
export default postsSlice;
