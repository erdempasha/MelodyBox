import { Text, View } from 'react-native';
import { useLocalSearchParams } from "expo-router";

export default function AlbumModal() {
  const { album: albumId } = useLocalSearchParams<{ album: string }>();

  return (
    <View className='flex-1 justify-center items-center p-2'>
      <Text className='text-amber-200 font-extrabold' >{albumId}</Text>
    </View>
  );
}