import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { albumModal } from '@/constants/strings';

import { Button } from './Button';

import "@/global.css";

type Props = {
  id: string;
  name: string;
  contextCallback?: () => void
};

export function FileCard({
  id,
  name,
  contextCallback
}: Props) {
  
  return (
    <View
      className='flex-row items-center justify-center'
    >
      <Text className='text-gray-900'>{name}</Text>
      <Button
        className='bg-transparent h-fit w-fit ml-auto items-center justify-center'
        onPress={contextCallback}
      >
        <FontAwesome className='p-2' name="ellipsis-v" size={15} color="#111827" />
      </Button>
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
    <View className='min-h-fit w-full items-center justify-center'>
      <Text className='text-white text-xl font-bold opacity-85'>{albumName}</Text>
    </View>
  );
}

export function NoFileFound() {
  return (
    <View className='h-full w-full items-center justify-center'>
      <Text className=''>{albumModal.noFileFound}</Text>
    </View>
  );
}