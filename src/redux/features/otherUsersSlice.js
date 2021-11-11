import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  otherUsersArr: [],
};

const otherUsersSlice = createSlice({
  name: "otherUsers",
  initialState,
  reducers: {
    setOtherUsers: (state, action) => {
      state.otherUsersArr = action.payload;
    },
  },
});

export const { setOtherUsers } = otherUsersSlice.actions;
export default otherUsersSlice;
