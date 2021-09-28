import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

const initialState = {
  posts: [],
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
      state.posts = action.payload;
    },
    setAddToPosts: (state, action) => {
      state.posts = [action.payload, ...state.posts];
    },
    setRemoveFromPosts: (state, action) => {
      console.log(
        "removed" + JSON.stringify(state.posts.slice(action.payload, 1))
      );
      state.posts = removeItem(state.posts, action.payload);
    },
  },
});

export const { setPosts, setRemoveFromPosts, setAddToPosts } =
  postsSlice.actions;
export default postsSlice;
