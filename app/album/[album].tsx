import { FlatList, Text, View } from 'react-native';
import { router, useLocalSearchParams } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAlbumById,
} from "@/redux/selectors";

import {
  FileCard,
  Seperator,
  Header,
  NoFileFound
} from "@/components/fileListComponents";
import { LinkButton } from '@/components/LinkButton';
import { albumModal } from "@/constants/strings";

import "@/global.css";

export default function AlbumModal() {
  const { album: albumId } = useLocalSearchParams<{ album: string }>();
  const dispatch = useAppDispatch();
  const album = useAppSelector(state => getAlbumById(state, albumId))

  if (album === undefined) {
    return (
      <View className='flex-1 bg-white justify-center items-center'>
        <Text className='text-gray-900/75 font-bold'>{albumModal.albumNotFound}</Text>
        <LinkButton href="/(tabs)/library">
          <Text className='text-gray-200 font-bold px-7 py-3'>{albumModal.goBack}</Text>
        </LinkButton>
      </View>
    );
  }

  const { id, title, files, createdAt } = album;

  return (
    <View className='flex-1 justify-center items-center p-2'>
      <FlatList
        data={files}
        renderItem={
          ({ item: file }) => (FileCard({ id: file.id, name: file.name }))
        }
        ItemSeparatorComponent={Seperator}
        ListEmptyComponent={NoFileFound}
        ListHeaderComponent={() => Header({ albumName: title })}
        keyExtractor={file => file.id}
      />
    </View>
  );
}