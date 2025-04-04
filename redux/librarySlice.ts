import { createSlice, PayloadAction, createAsyncThunk, createSelector, nanoid } from "@reduxjs/toolkit";
import type { RootState, AppThunk } from "@/redux/store"

export type IdType = string; // May change

export interface MediaFile {
  id: IdType;
  uri: string;
  name: string;
  type: 'audio' | 'video';
}
  
export interface Album {
  id: IdType;
  title: string;
  files: MediaFile[];
  createdAt: number;
}

interface LibraryState {
  albums: Album[];
}

const initialState: LibraryState = {
  albums: [],
};

const albumSlice = createSlice({
  name: 'albums',
  initialState,
  reducers: {
    createAlbum: {
      reducer(state, action: PayloadAction<Album>) {
        state.albums.push(action.payload);
      },
      prepare(title: string) {
        return {
          payload: {
            id: nanoid(),
            title,
            files: [],
            createdAt: Date.now(),
          } as Album,
        };
      },
    },
    deleteAlbum(state, action: PayloadAction<string>) {
      state.albums = state.albums.filter(album => album.id !== action.payload);
      if (state.selectedAlbumId === action.payload) {
        state.selectedAlbumId = null;
      }
    },
    renameAlbum(state, action: PayloadAction<{ albumId: string; newTitle: string }>) {
      const album = state.albums.find(a => a.id === action.payload.albumId);
      if (album) {
        album.title = action.payload.newTitle;
      }
    },
    addFileToAlbum(state, action: PayloadAction<{ albumId: string; file: MediaFile }>) {
      const album = state.albums.find(a => a.id === action.payload.albumId);
      if (album && !album.files.find(f => f.id === action.payload.file.id)) {
        album.files.push(action.payload.file);
      }
    },
    removeFileFromAlbum(state, action: PayloadAction<{ albumId: string; fileId: string }>) {
      const album = state.albums.find(a => a.id === action.payload.albumId);
      if (album) {
        album.files = album.files.filter(f => f.id !== action.payload.fileId);
      }
    },
    selectAlbum(state, action: PayloadAction<string>) {
      state.selectedAlbumId = action.payload;
    },
    clearSelectedAlbum(state) {
      state.selectedAlbumId = null;
    },
  },
});

export const {
  createAlbum,
  deleteAlbum,
  renameAlbum,
  addFileToAlbum,
  removeFileFromAlbum,
  selectAlbum,
  clearSelectedAlbum,
} = albumSlice.actions;

export default albumSlice.reducer;
