import { View, Text } from 'react-native';

import { LinkButton } from '@/components/LinkButton';
import { notFoundScreen } from '@/constants/strings';

import "@/global.css";

export default function NotFoundScreen() {
  return (
    <View className='flex-1 justify-center items-center gap-8'>
      <Text className='text-gray-800 text-2xl font-bold'>
        { notFoundScreen.message }
      </Text>
      <LinkButton href="/">
        <Text className='text-gray-200 font-bold text-2xl px-7 py-3'>
          { notFoundScreen.returnHomeButton }
        </Text>
      </LinkButton>
    </View>
  );
}