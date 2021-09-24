import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCloseModal } from "../redux/features/modalsSlice";
import { AiFillLinkedin, AiOutlineMail, AiOutlineClose } from "react-icons/ai";
import { FaUser, FaUserFriends } from "react-icons/fa";
import "./ContactInfoModal.css";
const ContactInfoModal = ({ profileInfo, following }) => {
  const dispatch = useDispatch();
  const { showContactCardModal } = useSelector((state) => state.modals);
  const name = `${profileInfo.name.firstName} ${
    profileInfo.name.lastName || null
  }`;
  const contactCardRef = useRef();
  const handleContactActive = (e) => {
    if (contactCardRef.current && contactCardRef.current.contains(e.target)) {
      return;
    } else if (showContactCardModal === false) {
      console.log("CLosing");
      dispatch(setCloseModal());
    } else return;
  };

  useEffect(() => {
    document.addEventListener("click", handleContactActive);

    return () => {
      document.removeEventListener("click", handleContactActive);
    };
  }, []);

  return (
    <div className="contactInfoModal">
      <section ref={contactCardRef} className="contactCard">
        <div className="contactInfo-header">
          <p>{name}</p>
          <AiOutlineClose
            className="closeContactModal"
            onClick={() => dispatch(setCloseModal())}
          />
        </div>
        <ul className="contactCard-main">
          <li>
            <AiFillLinkedin className="contactIcon" />
            <span className="contactItem-details">
              <p className="title">{name}'s Profile</p>
              <p className="detail">{`linkedin.com/in/${profileInfo.username}`}</p>
            </span>
          </li>
          <li>
            <AiOutlineMail className="contactIcon" />
            <span className="contactItem-details">
              <p className="title">Email</p>
              <p className="detail">{profileInfo.email}</p>
            </span>
          </li>
          <li>
            <FaUserFriends className="contactIcon" />
            <span className="contactItem-details">
              <p className="title">
                {following ? "Connected" : "Not Connected"}
              </p>
              <p className="detail" style={{ color: "grey" }}>
                {" "}
                {following
                  ? "Connected with " + name
                  : "You are not connected with " + name}
              </p>
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default ContactInfoModal;
