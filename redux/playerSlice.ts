import { createSlice, PayloadAction, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import type { RootState, AppThunk } from "@/redux/store"

import { IdType } from "./librarySlice";

export interface PlayerState {
  albumId: IdType;
  mediaId: IdType;
  
}