import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";

const initialState = {
  initialRequestsFetchMade: false,
  loadingConnectionRequests: null,
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
    setLoadingConnectionRequests: (state, action) => {
      state.loadingConnectionRequests = action.payload;
    },
    setConnectionRequests: (state, action) => {
      const unsortedConnectionRequests = action.payload;
      state.connectionRequests = unsortedConnectionRequests.sort((a, b) => {
        return new Date(b.published) - new Date(a.published);
      });
    },
    setAddToConnectionsRequests: (state, action) => {
      console.log(action.payload);
      console.log("Adding new notifications");
      // let i = action.payload;
      state.notifications = [action.payload, ...state.connectionRequests];

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
    setRequestsFetchMade: (state, action) => {
      state.initialRequestsFetchMade = action.payload;
    },
  },
});

export const {
  setRequestsFetchMade,
  setConnectionRequests,
  setAddToConnectionsRequests,
  setLoadingConnectionRequestss,
} = connectionRequestsSlice.actions;
export default connectionRequestsSlice;
