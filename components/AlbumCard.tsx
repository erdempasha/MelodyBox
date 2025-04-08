import { View, Text } from 'react-native';
import { libraryScreen } from '@/constants/strings';

type Props = {
  id: string;
  name: string;
};

export function AlbumCard({
  id,
  name,
}: Props) {
  
  return (
    <View className='min-h-fit w-full items-center justify-center p-2'>
      <Text className='text-white'>{name} {id}</Text>
    </View>
  );
}

export function Seperator() {
  return (
    <View className='flex-row justify-center items-center'>
      <View className='flex-1 h-1 rounded-md bg-white opacity-70' />
    </View>
  );
}

export function AlbumHeader() {
  return (
    <View className='min-h-fit w-full items-center justify-center p-2'>
      <Text className='text-white text-xl font-bold opacity-85'>{libraryScreen.albumHeader}</Text>
    </View>
  );
}

export function NoAlbumFound() {
  return (
    <View className=''>
      <Text className=''>{libraryScreen.noAlbumFound}</Text>
    </View>
  );
}