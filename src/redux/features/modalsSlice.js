import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

const initialState = {
  showUploadImage: false,
};

const modalsSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    setShowUploadImage: (state) => {
      state.showUploadImage = true;
    },
    setCloseUploadImage: (state) => {
      state.showUploadImage = false;
    },
  },
});

export const { setShowUploadImage, setCloseUploadImage } = modalsSlice.actions;
export default modalsSlice;
