import { useState } from "react";
import { View, FlatList, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { Dialog, Input, Icon } from '@rneui/themed';

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAlbums,
} from "@/redux/selectors";
import { 
  createAlbum,
  deleteAlbum,
  IdType,
  renameAlbum,
} from "@/redux/librarySlice";

import {
  AlbumCard,
  Seperator,
  NoAlbumFound,
  AlbumHeader
} from "@/components/libraryComponents"
import { Button } from "@/components/Button"
import { libraryScreen } from "@/constants/strings";

type ContextActions = "rename" | "delete" | "notchosen";

export default function Library() {
  const [ createDialogVisible, setCreateDialogVisible ] = useState(false);
  const [ createDialogError, setCreateDialogError ] = useState(false);
  const [ albumName, setAlbumName ] = useState<string>("");

  const [ contextDialogVisible, setContextDialogVisible ] = useState(false);
  const [ contextDialogError, setContextDialogError ] = useState(false);
  const [ contextDialogState, setContextDialogState ] = useState<ContextActions>("notchosen");
  const [ chosenAlbum, setChosenAlbum ] = useState<IdType | undefined>(undefined);

  const dispatch = useAppDispatch();
  const albums = useAppSelector(getAlbums);

  const handleAddAlbum = () => {
    setCreateDialogVisible(true);
  };

  const handleCancelDialog = () => {
    setCreateDialogError(false);
    setCreateDialogVisible(false);
    setAlbumName("");
  };

  const handleSaveDialog = () => {
    if (albumName.trim() === "") {
      setCreateDialogError(true);
      return;
    }
    dispatch(createAlbum(albumName.trim()));
    handleCancelDialog();
  };

  const handleCancelContextDialog = () => {
    setChosenAlbum(undefined);
    setContextDialogError(false);
    setContextDialogState("notchosen");
    setContextDialogVisible(false);
    setAlbumName("");
  };

  const handleDeleteAlbum = () => {
    if (chosenAlbum !== undefined) {
      dispatch(deleteAlbum(chosenAlbum));
    }

    handleCancelContextDialog();
  };

  const handleRenameAlbum = () => {
    if (albumName.trim() === "") {
      setContextDialogError(true);
      return;
    }

    if (chosenAlbum !== undefined) {
      dispatch(renameAlbum({
        albumId: chosenAlbum,
        newTitle: albumName.trim(),
      }));
    }

    handleCancelContextDialog();
  };

  const contextDialogContent: Record<ContextActions, () => React.ReactNode> = {
    rename: () => (
      <>
        <Dialog.Title title={libraryScreen.renameAlbum} />
        <Input
          placeholder={libraryScreen.inputPlaceholder}
          errorMessage={contextDialogError ? libraryScreen.inputError : undefined}
          onChangeText={setAlbumName}
        />
        <Dialog.Actions>
          <Dialog.Button title={libraryScreen.cancel} onPress={handleCancelContextDialog} />
          <Dialog.Button title={libraryScreen.rename} onPress={handleRenameAlbum} />
        </Dialog.Actions>
      </>
    ),
    delete: () => (
      <>
        <Dialog.Title title={libraryScreen.deleteAlbum} />
        <Text>{libraryScreen.areYouSure}</Text>
        <Dialog.Actions>
          <Dialog.Button title={libraryScreen.cancel} onPress={handleCancelContextDialog} />
          <Dialog.Button title={libraryScreen.delete} onPress={handleDeleteAlbum} />
        </Dialog.Actions>
      </>
    ),
    notchosen: () => (
      <>
        <Dialog.Title title={libraryScreen.contextTitle} />
        <Dialog.Actions>
          <Dialog.Button title={libraryScreen.cancel} onPress={handleCancelContextDialog} />
          <Dialog.Button title={libraryScreen.delete} onPress={() => setContextDialogState("delete")} />
          <Dialog.Button title={libraryScreen.rename} onPress={() => setContextDialogState("rename")} />
        </Dialog.Actions>
      </>
    ),
  };

  const contextInvoke = (id: IdType) => {
    setChosenAlbum(id);
    setContextDialogVisible(true);
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="h-5/6 w-5/6 justify-center items-center rounded-3xl bg-red-500 shadow-gray-400 shadow-2xl p-5">
        <FlatList
          className="w-full"
          data={albums}
          renderItem={
            ({ item: album }) => (AlbumCard({ id: album.id, name: album.title, contextCallback: () => contextInvoke(album.id) }))
          }
          ItemSeparatorComponent={Seperator}
          ListEmptyComponent={NoAlbumFound}
          ListHeaderComponent={AlbumHeader}
          keyExtractor={album => album.id}
        /> 
        <Button
          className='ml-auto w-10 h-10 justify-center items-center bg-slate-800 rounded-full'
          onPress={handleAddAlbum}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </Button>
      </View>

      <Dialog
        isVisible={createDialogVisible}
        onBackdropPress={handleCancelDialog}
      >
        <Dialog.Title>{libraryScreen.dialogTitle}</Dialog.Title>
        <Input
          placeholder={libraryScreen.inputPlaceholder}
          leftIcon={<Icon name="music-note" type="material" size={20}/>}
          errorMessage={createDialogError ? libraryScreen.inputError: undefined}
          defaultValue={albumName}
          onChangeText={setAlbumName}
        />
        <Dialog.Actions>
          <Dialog.Button title={libraryScreen.save} onPress={handleSaveDialog}/>
          <Dialog.Button title={libraryScreen.cancel} onPress={handleCancelDialog}/>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        isVisible={contextDialogVisible}
        onBackdropPress={handleCancelContextDialog}
      >
        {contextDialogContent[contextDialogState]()}
      </Dialog>
    </View>  
  ); 
}
