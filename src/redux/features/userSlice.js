import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../firebase/firebaseConfig";

///ASYNC USER METHODS

export const loginUser = async (email, password) =>
  createAsyncThunk("users/login", async (dispatch, getState) => {
    console.log(email);
    return await signInWithEmailAndPassword(email, password)
      .then((res) => console.log(res.json))
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  });

export const signUp = (email, password) =>
  createAsyncThunk("user/signup", async (dispatch, getState) => {
    return await createUserWithEmailAndPassword(auth, email, password)
      .then((res) => console.log(res.json))
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  });

const initialState = {
  isAuth: null,
  user: null,
  userObj: null,
  msg: null,
  loading: null,
  selectedUser: null,
};
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserLogoutState: (state) => {
      state.user = null;
      state.isAuth = false;
      state.loading = false;
      state.userObj = null;
    },
    setActiveUser: (state, action) => {
      state.user = action.payload;
      state.isAuth = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setActiveUserObj: (state, action) => {
      state.userObj = action.payload;
      state.loading = false;
      state.isAuth = true;
    },

    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {
  setActiveUser,
  setActiveUserObj,
  setUserLogoutState,
  setLoading,
  setSelectedUser,
} = userSlice.actions;
export default userSlice;
