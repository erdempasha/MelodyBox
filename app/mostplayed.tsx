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
  setTrackAsync,
} from '@/redux/playerSlice';

import {
  MostPlayedCard,
  MostPlayedHeader,
  NoMostPlayedFound,
  MostPLayedSeperator,
} from "@/components/mostPlayedComponents";

export default function MostPlayedModal() {
  const dispatch = useAppDispatch();
  const albums = useAppSelector(getAlbums);

  const albumsToMostPlayedList = (
    albumList: Album[]
  ): {
    albumId: IdType;
    albumTitle: string;
    file: MediaFile;
  }[] => {
    return albumList.flatMap(
      album => album.files
        .filter(file => file.playCount !== 0)
        .map(file => ({
          albumId: album.id,
          albumTitle: album.title,
          file,
          playCount: file.playCount
        }))
    ).sort(
      (file1, file2) => file2.playCount - file1.playCount 
    ).slice(0, 50);
  };

  const mostPlayedList = albumsToMostPlayedList(albums);

  const handleCardClick = (albumId: IdType, file: MediaFile) => {
    dispatch(setTrackAsync({
      track: {
        albumId: albumId,
        mediaFile: file
      },
      albumTracks: mostPlayedList.map(item => ({ albumId: item.albumId, mediaFile: item.file }))
    }));

    router.push('/');
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
          data={mostPlayedList}
          renderItem={
            ({ item }) => (MostPlayedCard({
              albumTitle: item.albumTitle,
              fileName: item.file.name,
              cardCallback: () => handleCardClick(item.albumId, item.file),
              goToAlbumCallback: () => handleToAlbum(item.albumId, item.file.id), 
            }))
          }
          ItemSeparatorComponent={MostPLayedSeperator}
          ListEmptyComponent={NoMostPlayedFound}
          ListHeaderComponent={MostPlayedHeader}
          keyExtractor={item => item.file.id}
        />
      </View>
    </View>
  );
}