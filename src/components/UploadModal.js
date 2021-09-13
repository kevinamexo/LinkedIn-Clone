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
  const dispatch = useDispatch();
  const { showUploadImage } = useSelector((state) => state.modals);
  let im = [];
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.map((file) => {
      im = [...images, file];
      setImages((prevImages) => [...prevImages, file]);
    });
    console.log(im);
    console.log(images);
  }, []);
  const { getInputProps, getRootProps } = useDropzone({ onDrop });

  useEffect(() => {
    console.log("Show Upload Image");
    console.log(showUploadImage);
  }, []);
  const files = images.map((image) => (
    <div
      key={image.name}
      style={{ height: "70px", width: "70px", objectFit: "cover" }}
    >
      <img
        src={URL.createObjectURL(image)}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  ));

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
          <input {...getInputProps()} className="uploadImageModal-input" />
          <p className="uploadImageModal-choose">
            Select or drag {type} to upload
          </p>
          {images.length === 0 && (
            <div className="uploadImageModal__imagesPreview">
              {images && <div>{files}</div>}
            </div>
          )}
        </div>
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
