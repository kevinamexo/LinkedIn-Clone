import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// custom hook to get the current pathname in React

export const usePathname = () => {
  const location = useLocation();
  return location.pathname;
};
const useOutsideClick = (ref, ref2, callback) => {
  const handleClick = (e) => {
    if (
      ref.current &&
      !ref.current.contains(e.target) &&
      ref2.current &&
      !ref2.current.contains(e.target)
    ) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default useOutsideClick;

export const useGetScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState(null);

  function windowSizeListener() {
    setScreenWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", windowSizeListener);
    return () => {
      window.removeEventListener("resize", windowSizeListener);
    };
  }, []);

  return screenWidth;
};

export const nameFromObject = (obj) => {
  const fullName =
    obj.name &&
    `${
      obj.name.firstName.charAt(0).toUpperCase() + obj.name.firstName.slice(1)
    } ${
      obj.name.lastName.charAt(0).toUpperCase() + obj.name.lastName.slice(1)
    }`;
  return fullName;
};
