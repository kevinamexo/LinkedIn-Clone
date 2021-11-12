import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/userSlice";
import modalsSlice from "../features/modalsSlice";
import postsSlice from "../features/postsSlice";
import notificationsSlice from "../features/notificationsSlice";
import connectionRequestsSlice from "../features/connectionRequestsSlice";
import chatsSlice from "../features/chatsSlice";
import otherUsersSlice from "../features/otherUsersSlice";
import postPageSlice from "../features/postPage";
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    modals: modalsSlice.reducer,
    posts: postsSlice.reducer,
    notifications: notificationsSlice.reducer,
    connectionRequests: connectionRequestsSlice.reducer,
    chats: chatsSlice.reducer,
    otherUsers: otherUsersSlice.reducer,
    postPage: postPageSlice.reducer,
  },
});

export default store;
