import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setShowUploadImage,
  setCloseModal,
} from "../redux/features/modalsSlice";
import { useDropzone } from "react-dropzone";
import "./UploadImageModal.css";
import { AiOutlineClose } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";

import {
  getStorage,
  uploadBytes,
  uploadBytesResumable,
  ref,
  getDownloadURL,
} from "firebase/storage";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io";
import BeatLoader from "react-spinners/BeatLoader";
const UploadModal = ({ type }) => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [filesPresent, setFilesPresent] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const storage = getStorage();

  let fileCount = 0;
  const dispatch = useDispatch();
  const { showUploadImage } = useSelector((state) => state.modals);
  let im = [];
  const onDrop = useCallback((acceptedFiles) => {
    if (type === "video" && fileCount > 0) {
      setError("Only one video upload per post");
      setTimeout(() => {
        setError(null);
      }, 5000);
    } else if ((type === "video" && images.length === 0) || type === "images") {
      acceptedFiles.map((file) => {
        console.log(im.length);
        setImages((prevImages) => [...prevImages, file]);
        // im = [file];
      });
      fileCount += 1;
      // console.log(images);
    }
  }, []);
  let fileType = type === "video" ? "video/*" : "image/*";
  const { getInputProps, getRootProps } = useDropzone({
    onDrop,
    accept: fileType,
  });

  const imageFiles = images.map((image, idx) => <p key={idx}>{image.name} </p>);
  const videoFile = images.map((vid) => <p>{vid.name} </p>);

  const handleFirebaseUpload = () => {
    const promises = [];
    let filesArray = [];
    setUploading(true);
    images.map((file, idx) => {
      const fileRefPath = `${type === "video" ? "videos" : "images"}/${
        file.name
      }`;
      // create a reference to the imaages
      const fileRef = ref(storage, file.name);
      //upload blob from blob or file
      const uploadTask = uploadBytesResumable(fileRef, file);
      promises.push(uploadTask);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/unauthorized":
              console.log(`User doesn't have permission to access the object`);
              break;
            case "storage/canceled":
              console.log("User canceled the upload");
              break;

            // ...

            case "storage/unknown":
              console.log(
                "Unknown error occurred, inspect error.serverResponse"
              );
              break;
          }
        },
        async () => {
          await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            filesArray[idx] = downloadURL;
          });
        }
      );
    });

    Promise.all(promises)
      .then(() => {
        setDownloadUrls(filesArray);
        console.log(filesArray);
        console.log(images);
        setUploading(false);
        setUploadSuccess(true);
        setUploadMessage(
          `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded`
        );

        // setTimeout(() => {
        //   dispatch(setCloseModal());
        // }, 2000);
      })
      .catch((err) => {
        console.log("Error");
        setUploading(false);
        setUploadSuccess(false);
        setUploadMessage("Error Uploading file");
      });
  };

  useEffect(() => {
    console.log(progress);
  }, [progress]);

  const handleRemoveFile = (idx) => {
    let i = [...images];
    if (i.length === 1) {
      setImages([]);

      im = [];

      i = [];
    } else {
      i.splice(idx, 1);

      setImages([...i]);

      im = [...i];

      // console.log("after splice");
      // console.log([images.splice(idx, 1)]);
    }
  };

  return (
    <div className="uploadImageModal">
      <div className="uploadImageModal-form">
        <header>
          <p>Upload your {type}</p>
          {/* {images !== [] && (
            <BsCloudUpload
              {...getRootProps()}
              className="uploadImageModal-form__headerUpload"
            />
          )} */}
          <AiOutlineClose
            className="uploadImageModal__header-close"
            onClick={() => dispatch(setCloseModal())}
          />
        </header>
        {uploading === null ? (
          <div
            className="uploadImageModal-formInputs"
            style={
              images.length > 0
                ? {
                    alignItems: "flex-start",
                    justifyContent: "space-evenly",
                    height: "100%",
                  }
                : {}
            }
            {...getRootProps()}
          >
            <input
              {...getInputProps()}
              accept={type === "video" ? "video/*" : "images/*"}
              className="uploadImageModal-input"
            />
            <p className="uploadImageModal-choose">
              Select or drag {type} to upload
            </p>
          </div>
        ) : uploading === true ? (
          <div className="uploadingState">
            <h2>Uploading</h2>
            <BeatLoader size={15} loading={true} color="#0a66c2" />
          </div>
        ) : uploading === false && uploadMessage !== "" ? (
          <div
            className={
              uploadSuccess === true
                ? "uploadModal-success"
                : "uploadModal-error"
            }
          >
            <p>{uploadMessage}</p>
            <FaCheckCircle className="check" />
          </div>
        ) : null}
        {error && (
          <p style={{ margin: "0", backgroundColor: "red", color: "white" }}>
            {error}
          </p>
        )}
        {images.length > 0 && uploading === null && (
          <div className="uploadImageModal__imagesPreview">
            {type === "images" &&
              images &&
              images.map((img, idx) => (
                <div className="previewFile">
                  <p className="previewFile-Name">{img.name}</p>
                  <AiOutlineClose
                    className="previewFile-removeFile"
                    onClick={handleRemoveFile}
                  />
                </div>
              ))}
            {type === "video" &&
              images &&
              images.map((img) => (
                <div className="previewFile">
                  <p className="previewFile-Name">{img.name}</p>
                  <AiOutlineClose className="previewFile-removeFile" />
                </div>
              ))}
          </div>
        )}

        <footer className="uploadImageModal-footer">
          {uploadSuccess === null && (
            <>
              <button type="submit" className="uploadImageModal__footer-cancel">
                Cancel
              </button>
              <button
                className="uploadImageModal__footer-submit"
                onClick={() => handleFirebaseUpload()}
              >
                Done
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
export default UploadModal;
