import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

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

export interface LibraryState {
  albums: Album[];
}

const initialState: LibraryState = {
  albums: [],
};

const albumSlice = createSlice({
  name: 'albums',
  initialState,
  reducers: {
    createAlbum: (state, action: PayloadAction<string>) => {
      const newAlbum: Album = {
        id: nanoid(),
        title: action.payload,
        files: [],
        createdAt: Date.now()
      };
      state.albums = [...state.albums, newAlbum];
    },
    deleteAlbum: (state, action: PayloadAction<IdType>) => {
      state.albums = state.albums.filter(album => album.id !== action.payload);
    },
    renameAlbum: (state, action: PayloadAction<{ albumId: IdType; newTitle: string }>) => {
      state.albums = state.albums.map(
        (album) => {
          if (action.payload.albumId === album.id) {
            return {
              ...album,
              title: action.payload.newTitle,
            };
          }
          return album;
        }
      );
    },
    addFileToAlbum: (state, action: PayloadAction<{ albumId: IdType; file: MediaFile }>) => {
      state.albums = state.albums.map(
        (album) => {
          if (album.id === action.payload.albumId) {
            return {
              ...album,
              files: [
                ...album.files,
                action.payload.file
              ],
            };
          }
          return album;
        }
      );
    },
    removeFileFromAlbum: (state, action: PayloadAction<{ albumId: IdType; fileId: IdType }>) => {
      state.albums = state.albums.map(
        (album) => {
          if (album.id === action.payload.albumId) {
            return {
              ...album,
              files: album.files.filter(file => file.id !== action.payload.fileId)
            };
          }
          return album;
        }
      );
    },
    loadStateForTesting: (state, action: PayloadAction<LibraryState>) => {
      return action.payload;
    },
  },
});

export const {
  createAlbum,
  deleteAlbum,
  renameAlbum,
  addFileToAlbum,
  removeFileFromAlbum,
  loadStateForTesting,
} = albumSlice.actions;

export default albumSlice.reducer;