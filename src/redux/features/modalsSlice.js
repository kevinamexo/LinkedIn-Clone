import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

const initialState = {
  modalActive: false,
  showUploadImage: false,
  showCreatePostModal: false,
  showUploadVideo: false,
  searchActive: false,
  showContactCardModal: false,
  showEditSummaryModal: false,
};

const modalsSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    setShowUploadImage: (state) => {
      state.showUploadImage = true;
      state.modalActive = true;
    },
    setCloseModal: (state) => initialState,
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
    setCloseSearchModal: (state) => {
      state.searchActive = false;
    },
    setShowContactCardModal: (state, action) => {
      state.showContactCardModal = true;
      state.modalActive = true;
    },
    setShowEditSummaryModal: (state, action) => {
      state.showEditSummaryModal = true;
      state.modalActive = true;
    },
  },
});

export const {
  setShowUploadImage,
  setShowUploadVideo,
  setShowCreatePostModal,
  setCloseModal,
  setCloseSearchModal,
  setSearchActive,
  setShowContactCardModal,
  setShowEditSummaryModal,
} = modalsSlice.actions;
export default modalsSlice;
