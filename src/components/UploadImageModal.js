import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./UploadImageModal.css";
import { BsCloudUpload } from "react-icons/bs";

const UploadImageModal = () => {
  const [images, setImages] = useState([]);
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
    console.log(images.length);
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
          <p>Upload your image</p>
          {images !== [] && (
            <BsCloudUpload
              {...getRootProps()}
              className="uploadImageModal-form__headerUpload"
            />
          )}
        </header>
        <div
          className="uploadImageModal-formInputs"
          style={
            images.length > 0 && {
              alignItems: "flex-start",
              justifyContent: "space-evenly",
              height: "100%",
            }
          }
          {...getRootProps()}
        >
          <input {...getInputProps()} className="uploadImageModal-input" />
          {images.length === 0 ? (
            <p className="uploadImageModal-choose">
              Select or drag images to upload
            </p>
          ) : (
            <div className="uploadImageModal__imagesPreview">
              {images && <div style={{ display: "flex" }}>{files}</div>}
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

export default UploadImageModal;
