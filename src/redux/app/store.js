import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/userSlice";
import modalsSlice from "../features/modalsSlice";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    modals: modalsSlice.reducer,
  },
});

export default store;
