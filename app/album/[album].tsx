import React from 'react';
import { useRef, useState } from 'react';
import { FlatList, Text, View, TextInput } from 'react-native';
import { router, useLocalSearchParams } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { Dialog, Input, Icon } from '@rneui/themed';

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAlbumById,
} from "@/redux/selectors";
import { addFileToAlbum, MediaTypes } from '@/redux/librarySlice';

import {
  FileCard,
  Seperator,
  Header,
  NoFileFound
} from "@/components/fileListComponents";
import { LinkButton } from '@/components/LinkButton';
import { Button } from "@/components/Button"
import { albumModal } from "@/constants/strings";


export default function AlbumModal() {
  const { album: albumId } = useLocalSearchParams<{ album: string }>();
  const dispatch = useAppDispatch();
  const album = useAppSelector(state => getAlbumById(state, albumId))
  const [ dialogVisible, setDialogVisible ] = useState(false);
  const [ dialogError, setDialogError ] = useState(false);

  const [ pickedFileUri, setPickedFileUri ] = useState<string>("");
  const [ pickedMediaType, setPickedMediaType ] = useState<MediaTypes>("audio");
  const [ fileName, setFileName ] = useState<string>("");

  const handleAddFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/*" , "video/*"],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.assets === null) {return;}

    const { mimeType, name, uri } = result.assets[0];
    const cleanName = name.replace(/\.[^/.]+$/, "");
    const mediaType: MediaTypes = mimeType?.startsWith("video")? "video": "audio";

    setFileName(cleanName);
    setPickedMediaType(mediaType);
    setPickedFileUri(uri);
    setDialogVisible(true);
  };

  const handleCancelDialog = () => {
    setDialogError(false);
    setDialogVisible(false);

    setFileName("");
    setPickedMediaType("audio");
    setPickedFileUri("");
  };

  if (album === undefined) {
    return (
      <View className='flex-1 bg-white justify-center items-center'>
        <Text className='text-gray-900/75 font-bold'>{albumModal.albumNotFound}</Text>
        <LinkButton href="/(tabs)/library">
          <Text className='text-gray-200 font-bold px-7 py-3'>{albumModal.goBack}</Text>
        </LinkButton>
      </View>
    );
  }

  const { id, title, files, createdAt } = album;

  const handleSaveDialog = () => {
    if (fileName === "") {
      setDialogError(true);
      return;
    }

    dispatch(addFileToAlbum({
      albumId: id,
      name: fileName,
      uri: pickedFileUri,
      type: pickedMediaType,
    }));
    handleCancelDialog();
  };

  return (
    <View className='flex-1 justify-center items-center p-2'>
      <View className="h-5/6 w-5/6 justify-center items-center rounded-3xl bg-blue-500 shadow-gray-400 shadow-2xl p-5">
        <Button
          className='w-10 h-10 absolute right-5 top-5 justify-center items-center bg-slate-800 rounded-full'
          onPress={handleAddFile}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </Button>
        <FlatList
          data={files}
          renderItem={
            ({ item: file }) => (FileCard({ id: file.id, name: file.name }))
          }
          ItemSeparatorComponent={Seperator}
          ListEmptyComponent={NoFileFound}
          ListHeaderComponent={() => Header({ albumName: title })}
          keyExtractor={file => file.id}
        />
      </View>

      <Dialog
        isVisible={dialogVisible}
        onBackdropPress={handleCancelDialog}
      >
        <Dialog.Title>{albumModal.dialogTitle}</Dialog.Title>
        <Input
          placeholder={albumModal.inputPlaceholder}
          leftIcon={<Icon name="music-note" type="material" size={20}/>}
          errorMessage={dialogError ? albumModal.inputError: undefined}
          defaultValue={fileName}
          onChangeText={setFileName}
        />
        <Dialog.Actions>
          <Dialog.Button title={albumModal.save} onPress={handleSaveDialog}/>
          <Dialog.Button title={albumModal.cancel} onPress={handleCancelDialog}/>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}