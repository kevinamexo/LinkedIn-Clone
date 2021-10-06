import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/userSlice";
import modalsSlice from "../features/modalsSlice";
import postsSlice from "../features/postsSlice";
import notificationsSlice from "../features/notificationsSlice";
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    modals: modalsSlice.reducer,
    posts: postsSlice.reducer,
    notifications: notificationsSlice.reducer,
  },
});

export default store;
