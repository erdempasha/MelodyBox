import { View, Text } from 'react-native';
import { libraryScreen } from '@/constants/strings';

import { LinkButton } from './LinkButton';

type Props = {
  id: string;
  name: string;
};

export function AlbumCard({
  id,
  name,
}: Props) {
  
  return (
    <LinkButton
      className='min-h-fit w-full items-center justify-center p-2'
      href={{
        pathname: "/album/[album]",
        params: {
          album: id,
        }
      }}
    >
      <Text className='text-white'>{name} {id}</Text>
    </LinkButton>
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