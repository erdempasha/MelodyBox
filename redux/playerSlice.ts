import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    playTrack: (state, action: PayloadAction<Track>) => {
      
    },
  },
});

export const {
  //
} = playerSlice.actions;

export default playerSlice.reducer;