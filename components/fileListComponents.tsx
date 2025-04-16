import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { albumModal } from '@/constants/strings';

import { Button } from './Button';

import "@/global.css";

type Props = {
  id: string;
  name: string;
  highlight?: boolean;
  downButtonCallback?: () => void;
  upButtonCallback?: () => void;
  cardClickCallback?: () => void;
  contextCallback?: () => void
};

export function FileCard({
  id,
  name,
  highlight,
  downButtonCallback,
  upButtonCallback,
  cardClickCallback,
  contextCallback
}: Props) {
  
  return (
    <View
      className={
        highlight === true?
        'flex-row items-center justify-center bg-sky-400 rounded-md':
        'flex-row items-center justify-center'
      }
    >
      <Button
        className='bg-transparent h-fit w-auto items-center justify-center p-2'
        onPress={cardClickCallback}
      >
        <Text className='text-gray-900'>{name}</Text>
      </Button>

      <Button
        className='bg-transparent h-fit w-fit ml-auto items-center justify-center'
        onPress={downButtonCallback}
      >
        <FontAwesome className='p-2' name="angle-down" size={24} color="#111827" />
      </Button>

      <Button
        className='bg-transparent h-fit w-fit ml-5 items-center justify-center'
        onPress={upButtonCallback}
      >
        <FontAwesome className='p-2' name="angle-up" size={24} color="#111827" />
      </Button>

      <Button
        className='bg-transparent h-fit w-fit ml-5 items-center justify-center'
        onPress={contextCallback}
      >
        <FontAwesome className='p-2' name="ellipsis-v" size={16} color="#111827" />
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