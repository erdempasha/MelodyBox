import { useState } from "react";
import { View, FlatList } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { Dialog, Input, Icon } from '@rneui/themed';

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAlbums,
} from "@/redux/selectors";
import { createAlbum } from "@/redux/librarySlice";

import {
  AlbumCard,
  Seperator,
  NoAlbumFound,
  AlbumHeader
} from "@/components/libraryComponents"
import { Button } from "@/components/Button"
import { libraryScreen } from "@/constants/strings";

export default function Library() {
  const [ dialogVisible, setDialogVisible ] = useState(false);
  const [ dialogError, setDialogError ] = useState(false);
  const [ albumName, setAlbumName ] = useState<string>("");

  const dispatch = useAppDispatch();
  const albums = useAppSelector(getAlbums);

  const handleAddAlbum = () => {
    setDialogVisible(true);
  };

  const handleCancelDialog = () => {
    setDialogError(false);
    setDialogVisible(false);
    setAlbumName("");
  };

  const handleSaveDialog = () => {
    if (albumName === "") {
      setDialogError(true);
      return;
    }

    dispatch(createAlbum(albumName));
    handleCancelDialog();
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="h-5/6 w-5/6 justify-center items-center rounded-3xl bg-red-500 shadow-gray-400 shadow-2xl p-5">
        <Button
          className='w-10 h-10 absolute right-5 top-5 justify-center items-center bg-slate-800 rounded-full'
          onPress={handleAddAlbum}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </Button>
        <FlatList
          data={albums}
          renderItem={
            ({ item: album }) => (AlbumCard({ id: album.id, name: album.title }))
          }
          ItemSeparatorComponent={Seperator}
          ListEmptyComponent={NoAlbumFound}
          ListHeaderComponent={AlbumHeader}
          keyExtractor={album => album.id}
        /> 
      </View>

      <Dialog
        isVisible={dialogVisible}
        onBackdropPress={handleCancelDialog}
      >
        <Dialog.Title>{libraryScreen.dialogTitle}</Dialog.Title>
        <Input
          placeholder={libraryScreen.inputPlaceholder}
          leftIcon={<Icon name="music-note" type="material" size={20}/>}
          errorMessage={dialogError ? libraryScreen.inputError: undefined}
          defaultValue={albumName}
          onChangeText={setAlbumName}
        />
        <Dialog.Actions>
          <Dialog.Button title={libraryScreen.save} onPress={handleSaveDialog}/>
          <Dialog.Button title={libraryScreen.cancel} onPress={handleCancelDialog}/>
        </Dialog.Actions>
      </Dialog>
    </View>  
  ); 
}
