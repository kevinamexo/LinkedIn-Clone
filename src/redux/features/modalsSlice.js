import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

const initialState = {
  modalActive: false,
  showUploadImage: false,
  showCreatePostModal: false,
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
      state.modalActive = false;
      state.showCreatePostModal = false;
    },
    setShowCreatePostModal: (state) => {
      state.showCreatePostModal = true;
      state.modalActive = true;
    },
  },
});

export const { setShowUploadImage, setShowCreatePostModal, setCloseModal } =
  modalsSlice.actions;
export default modalsSlice;
