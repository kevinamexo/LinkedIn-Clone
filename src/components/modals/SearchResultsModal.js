import React, { useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { BsDot } from "react-icons/bs";
import { useHistory } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import "./SearchResultsModal.css";

const SearchResultsModal = ({ data, loading }) => {
  const history = useHistory();
  return (
    <div className="searchResultsModal">
      {loading === true ? (
        <div className="searchResultsModal-loading">
          <ClipLoader color={"#0a66c2"} size={50} />
        </div>
      ) : (
        <>
          {data && data.length > 0 && (
            <div className="searchResults">
              {data &&
                data.map((d) => (
                  <div
                    className="searchResult"
                    onClick={() => history.push(`/in/${d.username}`)}
                  >
                    {d.profilePhotoURL ? (
                      <img
                        src={d.profilePhotoURL}
                        className="search-profilePhoto"
                      />
                    ) : (
                      <FaUserCircle className="search-profilePhoto" />
                    )}
                    <BsDot className="dot" />
                    <p className="searchResult-name">
                      {d.name &&
                        `${
                          d.name.firstName.charAt(0).toUpperCase() +
                          d.name.firstName.slice(1)
                        } ${
                          d.name.lastName.charAt(0).toUpperCase() +
                          d.name.lastName.slice(1)
                        }`}
                    </p>
                    <p className="searchResult-username">@{d.username}</p>
                    <BsDot className="dot" />
                    <p className="searchResult-title">
                      {d.title || "LinkedIn Member"}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsModal;
