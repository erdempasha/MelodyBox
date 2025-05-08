import { View, Text } from 'react-native';

import { Button } from "@/components/Button"
import { MostPlayedModal } from "@/constants/strings";

type Props = {
  albumTitle: string;
  fileName: string;
  cardCallback?: () => void;
  queueCallback?: () => void;
  goToAlbumCallback?: () => void;
};

export function MostPlayedCard({
  albumTitle,
  fileName,
  cardCallback,
  queueCallback,
  goToAlbumCallback,
}: Props) {

  return (
    <View
      className='flex-row items-center justify-center'
    >      
      <Button
        className='bg-transparent h-fit flex-1 items-center justify-center p-2'
        onPress={cardCallback}
      >
        <Text className='text-white text-left mr-auto'>{albumTitle}: {fileName}</Text>
      </Button>

      <Button
        className='bg-transparent h-fit w-fit ml-5 py-1 px-2 rounded-md items-center justify-center active:bg-purple-800/55'
        onPress={queueCallback}
      >
        <Text className='text-white text-left font-semibold mr-auto'>{MostPlayedModal.queue}</Text>
      </Button>

      <Button
        className='bg-transparent h-fit w-fit ml-5 items-center justify-center'
        onPress={goToAlbumCallback}
      >
        <Text className='text-white text-left font-semibold mr-auto'>{MostPlayedModal.goToAlbum}</Text>
      </Button>
    </View>
  );
}

export function MostPlayedHeader() {
  return (
    <View className='h-fit w-full items-center justify-center'>
      <Text className='text-white text-xl font-bold opacity-85'>{MostPlayedModal.header}</Text>
    </View>
  );
}

export function NoMostPlayedFound() {
  return (
    <View className='h-full w-full items-center justify-center'>
      <Text className='text-white'>{MostPlayedModal.NoSongsFound}</Text>
    </View>
  );
}

export function MostPLayedSeperator() {
  return (
    <View className='flex-row justify-center items-center'>
      <View className='flex-1 h-1 rounded bg-white' />
    </View>
  );
}

