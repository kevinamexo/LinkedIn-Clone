import { auth } from "./firebaseConfig";
import { rtDB } from "./firebaseConfig";

export const uid = auth.currentUser.uid;
export const userStatusDatabaseRef = rtDB.ref("/status/" + uid);
