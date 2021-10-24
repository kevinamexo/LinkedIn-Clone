import React, { useEffect } from "react";
import { auth, rtDB } from "../firebase/firebaseConfig";

const TestPage = () => {
  // useEffect(() => {
  //   const subscribe = auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       const uid = user.uid;
  //       const userStatusDatabaseRef = rtDB().ref("/status/" + uid);
  //       console.log(userStatusDatabaseRef);
  //     }
  //   });
  // }, []);

  return <p>test</p>;
};

export default TestPage;
