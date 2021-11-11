import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchTerm: null,
};

const headerSearchSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
});

export const {} = headerSearchSlice.actions;
export default headerSearchSlice.reducer;
