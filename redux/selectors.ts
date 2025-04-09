import type { RootState, AppThunk } from "@/redux/store"
import { IdType } from "./librarySlice";

export const getMediaFile = (
  state: RootState,
  albumId: IdType, 
  fileId: IdType
) => {
  return state
    .library
    .albums
    .find(album => album.id === albumId)
    ?.files
    .find(file => file.id === fileId);
};

export const getAlbums = (
  state: RootState
) => state.library.albums;

export const getMediaFiles = (
  state: RootState,
  albumId: IdType,
) => {
  return state
    .library
    .albums
    .find(album => album.id === albumId)
    ?.files;
}