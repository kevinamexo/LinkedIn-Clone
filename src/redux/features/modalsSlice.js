import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

const initialState = {
  modalActive: false,
  showUploadImage: false,
  showCreatePostModal: false,
  showUploadVideo: false,
  searchActive: false,
};

const modalsSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    setShowUploadImage: (state) => {
      state.showUploadImage = true;
      state.modalActive = true;
    },
    setCloseModal: (state) => {
      state.showUploadImage = false;
      state.showUploadVideo = false;
      state.modalActive = false;
      state.showCreatePostModal = false;
      state.searchActive = false;
    },
    setShowCreatePostModal: (state) => {
      state.showCreatePostModal = true;
      state.modalActive = true;
    },
    setShowUploadVideo: (state) => {
      state.showUploadVideo = true;
      state.modalActive = true;
    },
    setSearchActive: (state) => {
      state.searchActive = true;
      state.modalActive = true;
    },
  },
});

export const {
  setShowUploadImage,
  setShowUploadVideo,
  setShowCreatePostModal,
  setCloseModal,
  setSearchActive,
} = modalsSlice.actions;
export default modalsSlice;
