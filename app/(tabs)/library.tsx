import { View, FlatList } from "react-native";
import "@/global.css";

import {
  AlbumCard,
  Seperator,
  NoAlbumFound,
  AlbumHeader
} from "@/components/AlbumCard";

const countries_placeholder_data = [
  {
    id: '1',
   name: 'Pakistan',
  },
  {
    id: '2',
    name: 'United Kingdom',
  },
  {
    id: '3',
    name: 'Israel',
  },
  {
    id: '4',
    name: 'India',
  },
  {
    id: '5',
    name: 'Nigeria',
  },
  {
    id: '6',
    name: 'Uganda',
  },
  {
    id: '7',
    name: 'United States',
  }
];

export default function Library() {

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="h-5/6 w-5/6 justify-center items-center rounded-3xl bg-red-500 shadow-gray-900 drop-shadow-xl p-5">
        <FlatList
          data={countries_placeholder_data}
          renderItem={
            ({ item }) => (AlbumCard({id: item.id, name: item.name}))
          }
          ItemSeparatorComponent={Seperator}
          ListEmptyComponent={NoAlbumFound}
          ListHeaderComponent={AlbumHeader}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );

}
