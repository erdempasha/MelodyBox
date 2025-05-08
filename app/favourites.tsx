import { FlatList, View  } from 'react-native';
import { router } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getAlbums } from "@/redux/selectors";

import {
  Album,
  IdType,
  MediaFile,
} from '@/redux/librarySlice';
import {
  addToQueue,
  setTrackAsync,
} from '@/redux/playerSlice';

import {
  FavCard,
  FavHeader,
  NoFavsFound,
  FavSeperator,
} from "@/components/favouritesComponents";

export default function FavouritesModal() {
  const dispatch = useAppDispatch();
  const albums = useAppSelector(getAlbums);

  const albumsToFavList = (
    albumList: Album[]
  ): {
    albumId: IdType;
    albumTitle: string;
    file: MediaFile;
  }[] => {
    return albumList.flatMap(
      album => album.files
        .filter(file => file.favourited)
        .map(file => ({
          albumId: album.id,
          albumTitle: album.title,
          file
        }))
    );
  };

  const favList = albumsToFavList(albums);

  const handleCardClick = (albumId: IdType, file: MediaFile) => {
    dispatch(setTrackAsync({
      track: {
        albumId: albumId,
        mediaFile: file
      },
      albumTracks: favList.map(item => ({ albumId: item.albumId, mediaFile: item.file }))
    }));

    router.push('/');
  };

  const handleQueue = (
    albumId: IdType,
    file: MediaFile
  ) => {
    dispatch(addToQueue({
      albumId: albumId,
      mediaFile: file
    }))
  }; 

  const handleToAlbum = (
    albumId: IdType,
    fileId: IdType
  ) => router.push({
    pathname: "/album/[album]",
    params: {
      album: albumId,
      highlight: fileId,
    }
  });
  
  return (
    <View className='flex-1 justify-center items-center p-2'>
      <View className="h-5/6 w-5/6 justify-center items-center rounded-3xl bg-purple-600 p-5">
        <FlatList
          className='w-full'
          data={favList}
          renderItem={
            ({ item }) => (FavCard({
              albumTitle: item.albumTitle,
              fileName: item.file.name,
              cardCallback: () => handleCardClick(item.albumId, item.file),
              queueCallback: () => handleQueue(item.albumId, item.file),
              goToAlbumCallback: () => handleToAlbum(item.albumId, item.file.id), 
            }))
          }
          ItemSeparatorComponent={FavSeperator}
          ListEmptyComponent={NoFavsFound}
          ListHeaderComponent={FavHeader}
          keyExtractor={item => item.file.id}
        />
      </View>
    </View>
  );
}