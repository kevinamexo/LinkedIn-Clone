import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

const initialState = {
  lastViewedRequests: null,
  prevLastViewedRequests: null,
  connectionRequests: [],
  newConnectionRequests: [],
  pastConnectionRequests: [],
  prevNewConnectionRequests: [],
  newConnectionRequestsAmount: [],
};

const connectionRequestsSlice = createSlice({
  name: "connectionRequests",
  initialState,
  reducers: {
    setConnectionRequests: (state, action) => {
      const unsortedConnectionRequests = action.payload;
      state.connectionRequests = unsortedConnectionRequests.sort((a, b) => {
        return new Date(b.published) - new Date(a.published);
      });
    },
    setConnectionRequestChanges: (state, action) => {
      console.log(action.payload);
      console.log("Adding new notifications");

      action.payload.forEach((n) => {
        state.notifications = [n, ...state.notifications];
      });
      // let i = [...state.notifications];
      // console.log(i);

      // state.newNotifications = i.filter(
      //   (x) => x.published >= state.prevLastNotification
      // );
      // state.newNotificationsAmount = state.newNotifications.length;
      // state.pastNotifications = i.filter(
      //   (x) => x.published < state.prevLastNotification
      // );
    },
  },
});

export const { setConnectionRequests, setConnectionRequestChanges } =
  connectionRequestsSlice.actions;
export default connectionRequestsSlice;
