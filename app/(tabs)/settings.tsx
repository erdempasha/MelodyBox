import { Text, View } from "react-native";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { persistor } from "@/redux/store";
import {
  loadStateForTesting,
  purgeState,
} from "@/redux/librarySlice"
import {
  stopPlaybackAsync,
  resetPlayerState
} from "@/redux/playerSlice";
import { sampleLibraryState } from '@/constants/testData';

import { Button } from "@/components/Button";
import { LinkButton } from "@/components/LinkButton";

import { settingsScreen } from "@/constants/strings";

import "@/global.css";

export default function Settings() {
  const dispatch = useAppDispatch();

  const loadFakeData = () => {
    dispatch(loadStateForTesting(sampleLibraryState));
    console.log("Data Loaded");
  };

  const purgeData = () => {
    dispatch(purgeState());
    dispatch(stopPlaybackAsync());
    dispatch(resetPlayerState());

    persistor.purge().then(
      () => {console.log("Data Purged")}
    )
  };

  return (
    <View className="flex-1 justify-center items-center gap-10 bg-white">
      <Text className="text-gray-700 text-3xl font-bold">{settingsScreen.appName}</Text>
      <Button onPress={purgeData}>
        <Text className="text-gray-200 font-bold px-7 py-3">{settingsScreen.purge}</Text>
      </Button>
      <Button
        className="flex-wrap justify-center items-center bg-transparent rounded-2xl"
        onPress={loadFakeData}
      >
        <Text className="text-gray-600 px-7 py-3">{settingsScreen.sampleData}</Text>
      </Button>
    </View>
  );

}