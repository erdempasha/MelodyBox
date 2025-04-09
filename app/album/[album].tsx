import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getMediaFiles,
} from "@/redux/selectors";

import {
  FileCard,
  Seperator,
  Header,
  NoFileFound
} from "@/components/fileListComponents";

import "@/global.css";

export default function AlbumModal() {
  const { album: albumId } = useLocalSearchParams<{ album: string }>();
  const dispatch = useAppDispatch();
  const files = useAppSelector(state => getMediaFiles(state, albumId));

  return (
    <View className='flex-1 justify-center items-center p-2'>
      <FlatList
        data={files}
        renderItem={
          ({ item: file }) => (FileCard({ id: file.id, name: file.name }))
        }
        ItemSeparatorComponent={Seperator}
        ListEmptyComponent={NoFileFound}
        ListHeaderComponent={Header}
        keyExtractor={file => file.id}
      />
    </View>
  );
}