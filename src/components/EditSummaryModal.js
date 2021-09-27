import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCloseModal } from "../redux/features/modalsSlice";
import { setUpdatedSummary } from "../redux/features/userSlice";
import { AiOutlineClose } from "react-icons/ai";
import TextareaAutosize from "react-textarea-autosize";
import "./EditSummary.css";
import { BeatLoader } from "react-spinners";
import { FaCheckCircle } from "react-icons/fa";
import { db } from "../firebase/firebaseConfig";
import {
  query,
  where,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const EditSummaryModal = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  // const { setCloseModal } = useSelector((state) => state.modals);
  const { userObj } = useSelector((state) => state.user);
  const [summary, setSummmary] = useState(userObj.summary);

  // useEffect(() =>())

  const handleEditSummary = async () => {
    try {
      setPosting(true);
      let userDocId;
      const summaryQuery = query(
        collection(db, "user"),
        where("username", "==", userObj.username)
      );

      const summarySnap = await getDocs(summaryQuery);
      summarySnap.forEach((doc) => {
        console.log("summaryDocID" + doc.id);
        console.log(doc.data());
        userDocId = doc.id;
      });
      console.log(userDocId);
      let userDocRef = doc(db, "user", userDocId);
      await updateDoc(userDocRef, {
        summary: summary,
      });
      setPosting(false);
      setUpdateSuccess(true);
      console.log("Updated summary");
      dispatch(setUpdatedSummary(summary));
      setTimeout(() => {
        // dispatch(setCloseModal());
      }, 2000);
    } catch (e) {}
  };

  useEffect(() => {}, []);

  return (
    <div className="editSummaryModal">
      {loading !== false ? (
        <p>Loading</p>
      ) : (
        <div className="editSummary">
          <header>
            Edit Your Summary{" "}
            <AiOutlineClose
              className="closeEditSummary"
              onClick={() => dispatch(setCloseModal())}
            />
          </header>

          <main className="editSummaryForm">
            {posting === null && (
              <TextareaAutosize
                className="editSummaryForm-body"
                style={{ resize: "none", width: "90%" }}
                placeholder={summary === "" && "Add your profile summary"}
                value={summary}
                onChange={(e) => setSummmary(e.target.value)}
              />
            )}
            {posting === false && updateSuccess == true && (
              <div className="uploadModal-success">
                <p>Summary updated successfully</p>
                <FaCheckCircle className="check" />
              </div>
            )}
          </main>

          <footer>
            <button
              className="editSummaryForm-post"
              disabled={!summary}
              onClick={handleEditSummary}
            >
              Post
            </button>
          </footer>
          {posting && (
            <div className="createPost__loading-post">
              <h2>Posting</h2>
              <BeatLoader size={15} loading={true} color="#0a66c2" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditSummaryModal;
