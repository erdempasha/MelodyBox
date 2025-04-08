import { useEffect } from "react";
import { View, FlatList } from "react-native";
import "@/global.css";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAlbums,
} from "@/redux/selectors";
import {
  loadStateForTesting
} from "@/redux/librarySlice"

import {
  AlbumCard,
  Seperator,
  NoAlbumFound,
  AlbumHeader
} from "@/components/AlbumCard";

import { fakeLibraryData } from "@/constants/testData";

export default function Library() {
  const dispatch = useAppDispatch();
  const albums = useAppSelector(getAlbums);

  useEffect(() => {
    dispatch(loadStateForTesting(fakeLibraryData));
  },[]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="h-5/6 w-5/6 justify-center items-center rounded-3xl bg-red-500 shadow-gray-900 drop-shadow-xl p-5">
        <FlatList
          data={albums}
          renderItem={
            ({ item: album }) => (AlbumCard({ id: album.id, name: album.title }))
          }
          ItemSeparatorComponent={Seperator}
          ListEmptyComponent={NoAlbumFound}
          ListHeaderComponent={AlbumHeader}
          keyExtractor={album => album.id}
        /> 
      </View> 
    </View>  
  ); 
  
}
