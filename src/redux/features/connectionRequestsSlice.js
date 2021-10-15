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
      // state.connectionRequests = [action.payload, ...state.connectionRequests];
    },
    setRequestsFetchMade: (state, action) => {
      state.initialRequestsFetchMade = action.payload;
    },
    removeFromRequests: (state, action) => {
      state.connectionRequests = removeItem(
        state.connectionRequests,
        action.payload
      );
    },
  },
});

export const {
  setRequestsFetchMade,
  setConnectionRequests,
  setAddToConnectionRequests,
  setLoadingConnectionRequests,
  removeFromRequests,
  setLastViewedRequests,
} = connectionRequestsSlice.actions;
export default connectionRequestsSlice;
