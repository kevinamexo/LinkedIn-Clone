import { createSlice, current } from "@reduxjs/toolkit";
import { remove } from "lodash-es";
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
const removeItem = (arr, index) => {
  let newArray = [...arr];
  if (index !== -1) {
    newArray.splice(index, 1);
    return newArray;
  }
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
    setLastViewedRequests: (state, action) => {
      state.lastViewedRequests = action.payload.toDate();
      state.prevLastViewedRequests = action.payload.toDate();
      state.newConnectionRequests = state.connectionRequests.filter((n) => {
        let date1 = new Date(n.published.seconds * 1000);
        let date2 = new Date(state.prevLastViewedRequests.seconds * 1000);
        if (date1 >= date2) {
          console.log(date1);
          console.log("NEWER");
          console.log(date2);
          return n;
        }
      });
      state.pastConnectionRequests = state.connectionRequests.filter((n) => {
        let date1 = new Date(n.published.seconds * 1000);
        let date2 = new Date(state.prevLastViewedRequests.seconds * 1000);
        if (date1 < date2) {
          console.log(date1);
          console.log("OLDER");
          console.log(date2);
          return n;
        }
      });
    },
    setLastConnectionRequestTime: (state, action) => {
      state.prevPrevLastViewedRequests = state.prevLastViewedRequests;
      state.prevLastViewedRequests = state.lastViewedRequests;
      state.lastViewedRequests = action.payload;
      state.newConnectionRequests = state.connectionRequests.filter((n) => {
        let date1 = new Date(n.published.seconds * 1000);
        let date2 = new Date(state.prevLastViewedRequests.seconds * 1000);
        if (date1 >= date2) {
          console.log(date1);
          console.log("NEWER");
          console.log(date2);
          return n;
        }
      });
      state.pastConnectionRequests = state.connectionRequests.filter((n) => {
        let date1 = new Date(n.published.seconds * 1000);
        let date2 = new Date(state.prevLastViewedRequests.seconds * 1000);
        if (date1 < date2) {
          console.log(date1);
          console.log("OLDER");
          console.log(date2);
          return n;
        }
      });
    },
    setAddToConnectionRequests: (state, action) => {
      console.log("SET ADD TO CONNETION REQUESTS");
      console.log(action.payload);
      console.log(current(state.connectionRequests));
      let newConnectionRequests = action.payload.filter(
        ({ username: id1 }) =>
          !state.connectionRequests.some(({ username: id2 }) => id2 === id1)
      );
      console.log(newConnectionRequests);

      state.connectionRequests = [
        ...newConnectionRequests,
        ...state.connectionRequests,
      ];
      state.newConnectionRequests = state.connectionRequests.filter((n) => {
        let date1 = new Date(n.published.seconds * 1000);

        let date2 = new Date(state.prevLastViewedRequests);
        if (date1 >= date2) {
          console.log(date1);
          console.log("NEWER");
          console.log(state.prevLastViewedRequests);
          console.log(date2);
          return n;
        }
      });
      state.pastConnectionRequests = state.connectionRequests.filter((n) => {
        let date1 = new Date(n.published.seconds * 1000);
        let date2 = new Date(state.prevLastViewedRequests);
        if (date1 < date2) {
          console.log(date1);
          console.log("OLDER");
          console.log(date2);
          return n;
        }
      });

      // state.connectionRequests = [action.payload, ...state.connectionRequests];
    },
    setRequestsFetchMade: (state, action) => {
      state.initialRequestsFetchMade = action.payload;
    },
    setFilterConnectionRequests: (state, action) => {
      let i = [...state.connectionRequests];
      console.log(i);
      state.newConnectionRequests = i.filter(
        (x) => x.published > state.prevLastViewedRequests
      );
      state.prevNewNotifications = i.filter(
        (x) => x.published > state.prevPrevLastViewedRequests
      );

      state.pastConnectionRequests = i.filter(
        (x) => x.published < state.prevLastViewedRequests
      );
    },
    removeFromRequests: (state, action) => {
      console.log(
        "removed" +
          JSON.stringify(state.connectionRequests.slice(action.payload, 1))
      );

      state.connectionRequests = removeItem(
        state.connectionRequests,
        action.payload
      );
      state.newConnectionRequests = state.connectionRequests.filter((n) => {
        let date1 = new Date(n.published.seconds * 1000);
        let date2 = new Date(state.prevLastViewedRequests.seconds * 1000);
        if (date1 >= date2) {
          console.log(date1);
          console.log("NEWER");
          console.log(date2);
          return n;
        }
      });
      state.pastConnectionRequests = state.connectionRequests.filter((n) => {
        let date1 = new Date(n.published.seconds * 1000);
        let date2 = new Date(state.prevLastViewedRequests.seconds * 1000);
        if (date1 < date2) {
          console.log(date1);
          console.log("OLDER");
          console.log(date2);
          return n;
        }
      });
    },
  },
});

export const {
  setRequestsFetchMade,
  setConnectionRequests,
  setAddToConnectionRequests,
  setFilterConnectionRequests,
  setLoadingConnectionRequests,
  removeFromRequests,
  setLastViewedRequests,
  setLastConnectionRequestTime,
} = connectionRequestsSlice.actions;
export default connectionRequestsSlice;
