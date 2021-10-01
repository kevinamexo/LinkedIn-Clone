import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

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
      state.posts = action.payload.sort((a, b) => {
        let c = new Date(a.published);
        let d = new Date(b.published);
        return d - c;
      });
    },
    setAddToPosts: (state, action) => {
      state.posts = [...state.posts, ...action.payload];
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
  },
});

export const { setPosts, setRemoveFromPosts, setAddToPosts, setLastPost } =
  postsSlice.actions;
export default postsSlice;
