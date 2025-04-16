import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

export type IdType = string; // May change

export type MediaTypes = 'audio' | 'video';

export interface MediaFile {
  id: IdType;
  uri: string;
  name: string;
  type: MediaTypes;
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
  name: 'library',
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
    addFileToAlbum: (state, action: PayloadAction<{ albumId: IdType, name: string, uri: string, type: MediaTypes }>) => {
      const newFile: MediaFile = {
        id: nanoid(),
        uri: action.payload.uri,
        name: action.payload.name,
        type: action.payload.type,
      }

      state.albums = state.albums.map(
        (album) => {
          if (album.id === action.payload.albumId) {
            return {
              ...album,
              files: [
                ...album.files,
                newFile
              ]
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
    renameFile: (state, action: PayloadAction<{ albumId: IdType, fileId: IdType, name: string }>) => {
      state.albums = state.albums.map(
        album => {
          if (album.id === action.payload.albumId) {
            return {
              ...album,
              files: album.files.map(
                file => {
                  if (file.id !== action.payload.fileId){
                    return file;
                  }
                  return {
                    ...file,
                    name: action.payload.name,
                  };
                }
              )
            };
          }
          return album;
        }
      );      
    },
    loadStateForTesting: (state, action: PayloadAction<LibraryState>) => {
      return action.payload;
    },
    purgeState: (state) => {
      return { albums: [] };
    },
    moveAlbumDown: (state, action: PayloadAction<{ albumId: IdType }>) => {
      const albums = state.albums;
      const index = albums.findIndex(album => album.id === action.payload.albumId);

      if (index < albums.length - 1 && index !== -1) {
        [ albums[index], albums[index + 1] ] = [ albums[index + 1], albums[index] ];
      }

      state.albums = albums;
    },
    moveAlbumUp: (state, action: PayloadAction<{ albumId: IdType }>) => {
      const albums = state.albums;
      const index = albums.findIndex(album => album.id === action.payload.albumId);

      if (index > 0) {
        [ albums[index], albums[index - 1] ] = [ albums[index - 1], albums[index] ];
      }

      state.albums = albums;
    },
    moveFileDown: (state, action: PayloadAction<{ albumId: IdType, fileId: IdType }>) => {
      state.albums = state.albums.map(
        album => {
          if (album.id === action.payload.albumId) {
            
            const files = album.files;
            const index = files.findIndex(file => file.id === action.payload.fileId);

            if (index < files.length - 1 && index !== -1) {
              [ files[index], files[index + 1] ] = [ files[index + 1], files[index] ];
            }

            return {
              ...album,
              files: files,
            };
          }
          return album;
        }
      ); 
    },
    moveFileUp: (state, action: PayloadAction<{ albumId: IdType, fileId: IdType }>) => {
      state.albums = state.albums.map(
        album => {
          if (album.id === action.payload.albumId) {
            
            const files = album.files;
            const index = files.findIndex(file => file.id === action.payload.fileId);

            if (index > 0) {
              [ files[index], files[index - 1] ] = [ files[index - 1], files[index] ];
            }

            return {
              ...album,
              files: files,
            };
          }
          return album;
        }
      );
    },
  },
});

export const {
  createAlbum,
  deleteAlbum,
  renameAlbum,
  addFileToAlbum,
  removeFileFromAlbum,
  renameFile,
  loadStateForTesting,
  purgeState,
  moveAlbumDown,
  moveAlbumUp,
  moveFileDown,
  moveFileUp,
} = albumSlice.actions;

export default albumSlice.reducer;