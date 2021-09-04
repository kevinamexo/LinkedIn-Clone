import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const useGetUser = async () => {
  const { user } = useSelector((state) => state.user);
  const [queryResults, setQueryResults] = useState([]);
  const q = query(collection(db, "user"), where("firstName", "==", "Kevin"));

  const querySnapshot = await getDocs(q);

  const qr = querySnapshot.forEach((doc) => ({
    ...doc.data(),
    docId: doc.id,
  }));

  setQueryResults(qr);

  return { queryResults, setQueryResults };
};

export default useGetUser;
