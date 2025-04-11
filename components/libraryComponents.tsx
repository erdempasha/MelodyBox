import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { libraryScreen } from '@/constants/strings';

import { Button } from './Button';
import { LinkButton } from './LinkButton';

import "@/global.css";

type Props = {
  id: string;
  name: string;
  contextCallback?: () => void
};

export function AlbumCard({
  id,
  name,
  contextCallback
}: Props) {
  
  return (
    <View
      className='flex-row items-center justify-center'
    >
      <LinkButton
        className='bg-transparent h-fit w-auto items-center justify-center p-2'
        href={{
          pathname: "/album/[album]",
          params: {
            album: id,
          }
        }}
      >
        <Text className='text-white'>{name}</Text>
      </LinkButton>
      <Button
        className='bg-transparent h-fit w-fit ml-auto items-center justify-center'
        onPress={contextCallback}
      >
        <FontAwesome className='p-2' name="ellipsis-v" size={15} color="white" />
      </Button>
    </View>
  );
}

export function Seperator() {
  return (
    <View className='flex-row justify-center items-center'>
      <View className='flex-1 h-1 rounded bg-white' />
    </View>
  );
}

export function AlbumHeader() {
  return (
    <View className='h-fit w-full items-center justify-center'>
      <Text className='text-white text-xl font-bold opacity-85'>{libraryScreen.albumHeader}</Text>
    </View>
  );
}

export function NoAlbumFound() {
  return (
    <View className='h-full w-full items-center justify-center'>
      <Text className='text-white'>{libraryScreen.noAlbumFound}</Text>
    </View>
  );
}