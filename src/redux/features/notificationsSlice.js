import { createSlice, current } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";
import _ from "lodash";
const initialState = {
  notifications: [],
  newNotifications: [],
  pastNotifications: [],
  prevPastNotifications: [],
  lastNotification: null,
  prevLastNotification: null,
  prevPrevLastNotification: null,
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
          console.log(date);
          console.log("newer");
          console.log(state.prevLastNotification);
          return n;
        }
      });
      let i = [...state.notifications];
      state.prevPastNotifications = i;

      state.pastNotifications = state.notifications.filter((n) => {
        let date = new Date(n.published.seconds * 1000);
        if (date < state.prevLastNotification) {
          console.log(date);
          console.log("older");
          console.log(state.prevLastNotification);
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
      if (state.prevPrevLastNotification === null) {
        state.prevPastNotifications = i.filter(
          (x) => x.published < state.prevLastNotification
        );
      } else if (state.prevPrevLastNotification !== null) {
        state.prevPastNotifications = i.filter(
          (x) => x.published < state.prevPrevLastNotification
        );
      }
    },
    setInitialNotificationTime: (state, action) => {
      state.lastNotification = action.payload;
      state.prevLastNotification = action.payload;
    },
    setLastNotificationTime: (state, action) => {
      console.log("LAST NOTIFCATION TIME");
      state.prevPrevLastNotification = state.prevLastNotification;
      state.prevLastNotification = state.lastNotification;
      state.lastNotification = action.payload;
      let i = [...state.notifications];
      console.log(i);
      state.newNotifications = i.filter(
        (x) => x.published > state.prevLastNotification
      );
      // state.lastNotification = new Date(action.payload.seconds * 1000);
      state.prevPastNotifications = i.filter(
        (x) => x.published > state.prevPrevLastNotification
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
