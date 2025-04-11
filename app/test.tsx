import { Text, View } from "react-native";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { persistor } from "@/redux/store";
import { loadStateForTesting } from "@/redux/librarySlice"
import { fakeLibraryData } from "@/constants/testData";

import { Button } from "@/components/Button";
import { LinkButton } from "@/components/LinkButton";

import "@/global.css";

export default function Test() {
  const dispatch = useAppDispatch();
  
  const loadFakeData = () => {
    dispatch(loadStateForTesting(fakeLibraryData));
    console.log("Data Loaded");
  };

  const purgeData = () => {
    persistor.purge().then(
      () => {console.log("Data Purged")}
    )
  };

  return (
    <View className=" flex-1 justify-center items-center gap-5 bg-white">
      <Button onPress={loadFakeData}>
        <Text className="text-gray-200 font-bold px-7 py-3">Load Fake Data</Text>
      </Button>
      <Button onPress={purgeData}>
        <Text className="text-gray-200 font-bold px-7 py-3">Purge Data</Text>
      </Button>
      <LinkButton href="/">
        <Text className="text-gray-200 font-bold px-7 py-3">Return Home</Text>
      </LinkButton>
    </View>
  );

}