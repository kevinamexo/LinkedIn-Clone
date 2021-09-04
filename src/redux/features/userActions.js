import { auth } from "../../firebase/firebaseConfig";

const loginWithEmailAnPassword = async (email, password) => {
  return auth.signInWithEmailAndPassword(email, password);
};

const signup = async (email, password) => {
  return auth.createUserWithEmailAndPassword;
};
