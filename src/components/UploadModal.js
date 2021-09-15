import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setShowUploadImage,
  setCloseModal,
} from "../redux/features/modalsSlice";
import { useDropzone } from "react-dropzone";
import "./UploadImageModal.css";
import { BsCloudUpload } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";

const UploadModal = ({ type }) => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [filesPresent, setFilesPresent] = useState(false);
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
        im = [...im, file];

        setImages(im);
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
        {error && (
          <p style={{ margin: "0", backgroundColor: "red", color: "white" }}>
            {error}
          </p>
        )}
        {images.length > 0 && (
          <div className="uploadImageModal__imagesPreview">
            {type === "images" &&
              images &&
              images.map((img, idx) => (
                <div className="previewFile">
                  <p className="previewFile-Name">{img.name}</p>
                  <AiOutlineClose
                    className="previewFile-removeFile"
                    onClick={() => {
                      let i = [...images];
                      i.splice(idx, 1);
                      console.log(i);
                      setImages([...i]);

                      // console.log("after splice");
                      // console.log([images.splice(idx, 1)]);
                    }}
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
          <button type="submit" className="uploadImageModal__footer-cancel">
            Cancel
          </button>
          <button type="submit" className="uploadImageModal__footer-submit">
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};
export default UploadModal;
