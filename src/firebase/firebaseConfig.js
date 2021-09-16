import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref } from "firebase/storage";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyAa9vhPqb_OuN0OFyZpUYsEtFXlUvbdsoM",
  authDomain: "linkedin-clone-15854.firebaseapp.com",
  projectId: "linkedin-clone-15854",
  storageBucket: "linkedin-clone-15854.appspot.com",
  messagingSenderId: "380228062816",
  appId: "1:380228062816:web:bb6925a2f3964a9f72bd05",
});

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export const storage = getStorage();
export async function getUser(db) {
  const citiesCol = collection(db, "user");
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map((doc) => doc.data());
  return cityList;
}

export default firebaseApp;
