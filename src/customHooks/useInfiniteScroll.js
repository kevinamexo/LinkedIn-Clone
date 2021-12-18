import React, { useState } from "react";

const useInfiniteScroll = ({ items }) => {
  const [displayItems, setDisplayItems] = useState([]);
  const [slice, setSlice] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setDisplayItems(items.slice(0, slice));
  }, [items]);

  return items;
};

export default useInfiniteScroll;
