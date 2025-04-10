import { Text, View, StyleSheet  } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

import { LinkButton } from "@/components/LinkButton";

import "@/global.css";

export default function Index() {

  return (
    <View className=" flex-1 justify-center items-center bg-white">
      <View className="h-4/6 w-4/6 justify-center items-center rounded-3xl bg-green-600">
        <LinkButton href="/test">
          <Text>Admin Page</Text>
        </LinkButton>
      </View>
    </View>
  );

}