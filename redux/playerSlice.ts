import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState, AppThunk } from "@/redux/store"

import { IdType } from "./librarySlice";


interface Track {
  albumId: IdType;
  mediaId: IdType;
}

interface PlayerState {
  currentTrack?: Track;
  queue: Track[];
  mix: boolean;
}

const initialState: PlayerState = {
  currentTrack: undefined,
  queue: [],
  mix: false
};

const playerSlice = createSlice({
  name: 'albums',
  initialState,
  reducers: {
    
  },
});

export const {
  //
} = playerSlice.actions;

export default playerSlice.reducer;