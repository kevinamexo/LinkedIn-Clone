import { createSlice, current } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";
import _ from "lodash";
const initialState = {
  prevNewNotifications: null,
  lastNotification: null,
  prevLastNotification: null,
  notifications: [],
  newNotifications: [],
  pastNotifications: [],
  newNotificationsAmount: null,
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
      const unsortedNotifications = action.payload;
      state.notifications = unsortedNotifications.sort(function (a, b) {
        return new Date(b.published) - new Date(a.published);
      });
      state.newNotifications = state.notifications.filter((n) => {
        let date = new Date(n.published.seconds * 1000);
        if (date >= state.prevLastNotification) {
          return n;
        }
      });
      state.newNotificationsAmount = state.newNotifications.length;
      let i = [...state.notifications];
      state.prevPastNotifications = i;

      state.pastNotifications = state.notifications.filter((n) => {
        let date = new Date(n.published.seconds * 1000);
        if (date < state.prevLastNotification) {
          return n;
        }
      });
    },
    setNotificationChanges: (state, action) => {
      console.log(action.payload);
      console.log("Adding new notifications");

      action.payload.forEach((n) => {
        state.notifications = [n, ...state.notifications];
      });
      let i = [...state.notifications];
      console.log(i);

      state.newNotifications = i.filter(
        (x) => x.published >= state.prevLastNotification
      );
      state.newNotificationsAmount = state.newNotifications.length;
      state.pastNotifications = i.filter(
        (x) => x.published < state.prevLastNotification
      );
    },
    setInitialNotificationTime: (state, action) => {
      state.lastNotification = action.payload;
      state.prevLastNotification = action.payload;
    },
    setLastNotificationTime: (state, action) => {
      console.log("LAST NOTIFCATION TIME");
      state.prevLastNotification = state.lastNotification;
      state.lastNotification = action.payload;
      state.newNotificationsAmount = 0;
      let i = [...state.notifications];
      console.log(i);

      state.newNotifications = i.filter(
        (x) => x.published >= state.prevLastNotification
      );
      state.pastNotifications = i.filter(
        (x) => x.published < state.prevLastNotification
      );
    },
    setFilterNotifications: (state, action) => {
      let i = [...state.notifications];
      console.log(i);
      state.newNotifications = i.filter(
        (x) => x.published > state.prevLastNotification
      );
      state.pastNotifications = i.filter(
        (x) => x.published < state.prevLastNotification
      );
    },
  },
});

export const {
  setNotifications,
  setNotificationChanges,
  setLastNotificationTime,
  setInitialNotificationTime,
  setFilterNotifications,
} = notificationsSlice.actions;
export default notificationsSlice;
