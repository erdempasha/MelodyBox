import { View, Text } from 'react-native';
import { libraryScreen } from '@/constants/strings';

import "@/global.css";

type Props = {
  id: string;
  name: string;
};

export function FileCard({
  id,
  name,
}: Props) {
  
  return (
    <View className='min-h-fit w-full items-center justify-center p-2'>
      <Text className='text-black'>{name} {id}</Text>
    </View>
  );
}

export function Seperator() {
  return (
    <View className='flex-row justify-center items-center'>
      <View className='flex-1 h-1 rounded bg-gray-900' />
    </View>
  );
}

type HeaderProps = {
  albumName: string
}

export function Header({ albumName }: HeaderProps) {
  return (
    <View className='min-h-fit w-full items-center justify-center p-2'>
      <Text className='text-white text-xl font-bold opacity-85'>{albumName}</Text>
    </View>
  );
}

export function NoFileFound() {
  return (
    <View className=''>
      <Text className=''>{libraryScreen.noAlbumFound}</Text>
    </View>
  );
}