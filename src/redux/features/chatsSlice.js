import { current, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
const initialState = {
  currentChatUser: null,
  messages: [],
  groupedMessages: [],
  chatRoomId: null,
  initialMessageFetch: null,
  userChats: [],
  chatIds: [],
  chatIdsSet: null,
  chatUserNames: [],
  userFullNames: [],
  currentChatName: null,
  currentChatUserFullName: null,
  loadingChats: null,
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setCurrentChatUser: (state, action) => {
      console.log("setting");
      state.currentChatUser = action.payload;
    },
    setMessages: (state, action) => {
      console.log("setting messages");
      state.messages = action.payload.sort((a, b) => {
        return new Date(b.published) - new Date(a.published);
      });
      state.initialMessageFetch = true;
    },

    setAddToMessages: (state, action) => {
      // state.messages = [...state.messages, action.payload];
      let tmpMessages = [...state.messages];
      let tmpPayload = [...action.payload];
      console.log(current(state.messages));
      console.log(action.payload);
      const newItems = _.difference(tmpPayload, tmpMessages);
      const newItems2 = _.difference(tmpMessages, tmpPayload);
      console.log(newItems);
      console.log(newItems2);
      // state.messages = [...newItems, ...state.messages];
    },
    setChatRoomId: (state, action) => {
      console.log("RECEIVED CHAT ROOM ITEMS");
      state.chatRoomId = action.payload[0];
      state.currentChatName = action.payload[1];
    },
    setCurrentChatName: (state, action) => {
      state.currentChatName = action.payload;
    },
    setInitialMessageFetch: (state, action) => {
      state.initialMessageFetch = true;
    },
    setGroupedMessages: (state, action) => {
      state.groupedMessages = [...action.payload];
      console.log("SORTING USER CHATS");
      state.userChats = [...state.userChats].sort((a, b) => {
        return (
          new Date(b.lastMessage.published) - new Date(a.lastMessage.published)
        );
      });
    },
    setChatIdsSet: (state, action) => {
      state.chatIdsSet = action.payload;
    },
    setUserChats: (state, action) => {
      let receivedChats = action.payload[0];
      // state.userChats = action.payload[0];

      receivedChats.forEach((chat) => {
        console.log(state.userChats);
        let chatExists = state.userChats.some(
          (userChat) => userChat.chatName === chat.chatName
        );
        if (chatExists === true) {
          const chatIndex = state.userChats.findIndex(
            (userChat) => userChat.chatName === chat.chatName
          );
          console.log("CHAT EXISTS" + chatIndex);
          if (chatIndex !== -1) {
            console.log(state.userChats.length);
            state.userChats[chatIndex] = chat;
            console.log(state.userChats.length);
          }
        } else {
          console.log("CHAT DOES NOT EXIST");
          state.userChats = [chat, ...state.userChats];
        }
      });

      state.loadingChats = false;
    },
    setCurrentChatUserName: (state, action) => {
      const x = state.userFullNames.find((t) => t.username === action.payload);
      console.log("FOUND OBJECT");
      console.log(x);

      state.currentChatUserFullName =
        x &&
        x.name &&
        x.name &&
        `${
          x.name.firstName.charAt(0).toUpperCase() + x.name.firstName.slice(1)
        } ${
          x.name.lastName.charAt(0).toUpperCase() + x.name.lastName.slice(1)
        }`;
    },
    setAddToUserChats: (state, action) => {
      let chatObj = action.payload;
      let oldChat = state.chatIds.includes(chatObj.chatName);
      console.log("oldChat" + oldChat);
      console.log(oldChat);
      if (oldChat === false) {
        console.log("NEW CHAT");
        console.log(action.payload);
        let tmpuserChats = [action.payload, ...state.userChats];
        state.userChats = tmpuserChats;
        console.log("USER CHATS REDUX");
        console.log(state.userChats);
        state.chatIds = [action.payload.chatName, ...state.chatIds];
        state.chatIdsSet = true;
      }
    },
    setUserFullNames: (state, action) => {
      let usernamesArr = action.payload[0];
      console.log(typeof usernamesArr);
      console.log(usernamesArr);
      console.log([action.payload]);
      action.payload.forEach((user) => {
        const nameExists = state.userFullNames.some(
          (x) => x.username === user.username
        );
        if (nameExists === false) {
          state.userFullNames = [user, ...state.userFullNames];
        }
      });
    },
    setUpdateChat: (state, action) => {
      let p = action.payload;
      let index = action.payload[1];
      let newValue = action.payload[0];

      console.log(index);
      console.log(newValue);

      state.userChats[index] = newValue;
      // state.userChats=[...state.userChats].sort((a,b)=>(
      //   new Date(b.lastMessage.p)
      // ))
    },
    setChatRoomSnapshot: (state, action) => {
      console.log("RECEIVED");
      console.log(action.payload);
      let snapshotChange = action.payload;
      const chatExists = state.userChats.some(
        (chat) => chat.chatName === snapshotChange.chatName
      );

      console.log(current(state.userChats));
      console.log("CHAT EXISTS");
      console.log(chatExists);
      if (chatExists === true) {
        const chatIndex = state.userChats.findIndex(
          (chat) => (chat.chatName = action.payload.chatName)
        );

        console.log(chatIndex);
        if (chatIndex !== -1) {
          state.userChats[chatIndex] = action.payload;
        }
      }
      console.log("SORTING USER CHATS");
    },
    setResetChats: (state) => {
      state.currentChatUser = null;
      state.messages = [];
      state.groupedMessages = [];
      state.chatRoomId = null;
      state.initialMessageFetch = null;
      state.userChats = [];
      state.chatIds = [];
      state.chatIdsSet = null;
      state.chatUserNames = [];
      state.userFullNames = [];
      state.currentChatName = null;
      state.currentChatUserFullName = null;
      state.loadingChats = null;
    },
  },
});

export const {
  setCurrentChatUser,
  setCurrentChatName,
  setUsernameStr,
  setUserChats,
  setUpdateChat,
  setMessages,
  setAddToMessages,
  setChatRoomId,
  setInitialMessageFetch,
  setAddToUserChats,
  setChatIdsSet,
  setChatRoomSnapshot,
  setGroupedMessages,
  setCurrentChatUserName,
  setUserFullNames,
  setResetChats,
} = chatsSlice.actions;

export default chatsSlice;
