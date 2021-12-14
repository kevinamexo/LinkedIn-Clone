import { createSlice, current } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";
import _ from "lodash";
const initialState = {
  lastNotification: null,
  prevLastNotification: null,
  prevPrevLastNotification: null,
  notifications: [],
  newNotifications: [],
  prevNewNotifications: [],
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
    setInitialNotificationTime: (state, action) => {
      if (action.payload && action.payload.seconds) {
        state.lastNotification = new Date(action.payload.seconds * 1000);
        state.prevLastNotification = new Date(action.payload.seconds * 1000);
        state.prevPrevLastNotification = new Date(
          action.payload.seconds * 1000
        );
        console.log("LAST NOTIFICATIONS" + action.payload);
      }
    },
    setLastNotificationTime: (state, action) => {
      console.log("LAST NOTIFCATION TIME");
      if (action.payload) {
        state.prevPrevLastNotification = state.prevLastNotification;
        state.prevLastNotification = state.lastNotification;
        state.lastNotification = new Date(action.payload.seconds * 1000);
        // state.newNotificationsAmount = 0;
        // let i = [...state.notifications];
        // console.log(i);

        // state.newNotifications = i.filter(
        //   (x) => x.published >= state.lastNotification
        // );
        // state.pastNotifications = i.filter(
        //   (x) => x.published < state.lastNotification
        // );
        // if (state.prevPrevLastNotification) {
        //   state.prevNewNotifications = i.filter(
        //     (x) => x.published >= state.prevLastNotification
        //   );
        // } else if (!state.prevPrevLastNotification) {
        //   state.prevNewNotifications = i.filter(
        //     (x) => x.published >= state.prevLastNotification
        //   );
        // }
      }
    },
    setNotificationAndPageViews: (state, action) => {
      console.log(action.payload.notifications);

      state.notifications = [...action.payload.notifications].sort((a, b) => {
        return (
          new Date(b.published.seconds * 1000) -
          new Date(a.published.seconds * 1000)
        );
      });

      state.newNotifications = state.notifications
        .filter((n) => {
          let date = new Date(n.published.seconds * 1000);
          if (date >= state.lastNotification) {
            return n;
          }
        })
        .sort((a, b) => {
          return (
            new Date(b.published.seconds * 1000) -
            new Date(a.published.seconds * 1000)
          );
        });

      state.prevNewNotifications = state.notifications
        .filter((n) => {
          let date = new Date(n.published.seconds * 1000);
          if (date >= state.prevLastNotification) {
            return n;
          }
        })
        .sort((a, b) => {
          return (
            new Date(b.published.seconds * 1000) -
            new Date(a.published.seconds * 1000)
          );
        });

      state.prevPastNotifications = state.notifications
        .filter((n) => {
          let date = new Date(n.published.seconds * 1000);
          if (date < state.prevLastNotification) {
            return n;
          }
        })
        .sort((a, b) => {
          return (
            new Date(b.published.seconds * 1000) -
            new Date(a.published.seconds * 1000)
          );
        });
      // .sort((a, b) => {
      //   return (
      //     new Date(a.published.seconds * 1000) -
      //     new Date(b.published.seconds * 1000)
      //   );
      // });
    },
    modifyNotificationsChange: (state, action) => {
      console.log("RECEIVED MODIFIED CHANGES");
      let x = [...action.payload];
      console.log(x);
      let tmpNotifications = [...current(state.notifications)];
      const newNotis = x.filter(
        ({ postRefId: id1 }) =>
          !tmpNotifications.some(({ postRefId: id2 }) => id2 === id1)
      );
      const deleted = tmpNotifications.filter(
        ({ postRefId: id1 }) => !x.some(({ postRefId: id2 }) => id2 === id1)
      );

      state.notifications = [...newNotis, ...state.notifications];
      state.newNotifications = state.notifications
        .filter((n) => {
          let date = new Date(n.published.seconds * 1000);
          if (date >= state.lastNotification) {
            return n;
          }
        })
        .sort((a, b) => {
          return (
            new Date(b.published.seconds * 1000) -
            new Date(a.published.seconds * 1000)
          );
        });

      state.prevNewNotifications = state.notifications
        .filter((n) => {
          let date = new Date(n.published.seconds * 1000);
          if (date >= state.prevLastNotification) {
            console.log(date);
            console.log(state.prevLastNotification);
            return n;
          }
        })
        .sort((a, b) => {
          return (
            new Date(b.published.seconds * 1000) -
            new Date(a.published.seconds * 1000)
          );
        });

      state.prevPastNotifications = state.notifications
        .filter((n) => {
          let date = new Date(n.published.seconds * 1000);
          if (date < state.prevLastNotification) {
            return n;
          }
        })
        .sort((a, b) => {
          return (
            new Date(b.published.seconds * 1000) -
            new Date(a.published.seconds * 1000)
          );
        });
      console.log("NEW NOTIFICATIONS ARE");
      console.log(newNotis);
      console.log("DELETED NOTIFICATIONS ARE");
      console.log(deleted);
    },
    resetNewNotifications: (state, action) => {
      state.newNotifications = [];
      state.prevNewNotifications = [];
    },
  },
});

export const {
  addNewNotifications,
  setNotifications,
  setNotificationChanges,
  setLastNotificationTime,
  setInitialNotificationTime,
  setFilterNotifications,
  resetNewNotifications,
  setNotificationAndPageViews,
  modifyNotificationsChange,
} = notificationsSlice.actions;
export default notificationsSlice;
