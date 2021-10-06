import { createSlice, current } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";
import _ from "lodash";
const initialState = {
  notifications: [],
  lastNotification: null,
};

const removeItem = (arr, index) => {
  let newArray = [...arr];
  if (index !== -1) {
    newArray.splice(index, 1);
    return newArray;
  }
};
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    },
    setAddToNotifications: (state, action) => {
      state.notifications = [...action.payload, ...state.notifications];
    },
    setNotificationChanges: (state, action) => {
      console.log("Adding new notifications");
      let sortedPosts = [...action.payload, ...state.notifications].sort(
        function (a, b) {
          return new Date(b.date) - new Date(a.date);
        }
      );
      state.notifications = [...action.payload, ...state.notifications];
    },
    setLastNotificationTime: (state, action) => {
      state.lastNotificaton = action.payload;
    },
  },
});

export const {
  setNotifications,
  setNotificationChanges,
  setLastNotificationTime,
} = notificationsSlice.actions;
export default notificationsSlice;
