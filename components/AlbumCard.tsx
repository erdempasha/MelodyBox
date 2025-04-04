import { View, Text } from 'react-native';

type Props = {
  id: string;
  name: string;
};

export function AlbumCard({
  id,
  name,
}: Props) {

  return (
    <View className='flex-1 items-center justify-center'>
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
    <View className='flex-1 items-center justify-center'>
      <Text className='text-white text-xl font-bold opacity-85'>ALBUMS</Text>
    </View>
  );
}

export function NoAlbumFound() {
  return (
    <View>

    </View>
  );
}