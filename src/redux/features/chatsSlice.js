import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentChatUser: null,
  messages: [],
  chatRoomId: null,
  initialMessageFetch: null,
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setCurrentChatUser: (state, action) => {
      state.currentChatUser = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setAddToMessages: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    setChatRoomId: (state, action) => {
      state.chatRoomId = action.payload;
    },
    setInitialMessageFetch: (state, action) => {
      state.initialMessageFetch = true;
    },
  },
});

export const {
  setCurrentChatUser,
  setMessages,
  setAddToMessages,
  setChatRoomId,
  setInitialMessageFetch,
} = chatsSlice.actions;
export default chatsSlice;
