import React, { useEffect } from 'react';
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
import {
  addFileToAlbum,
  IdType,
  MediaFile,
  MediaTypes,
  removeFileFromAlbum,
  renameFile
} from '@/redux/librarySlice';
import {
  setTrackAsync,
  addToQueue,
} from '@/redux/playerSlice';

import {
  FileCard,
  Seperator,
  Header,
  NoFileFound
} from "@/components/fileListComponents";
import { LinkButton } from '@/components/LinkButton';
import { Button } from "@/components/Button"
import { albumModal } from "@/constants/strings";

type ContextActions = "rename" | "delete" | "notchosen";

export default function AlbumModal() {
  const { album: albumId, highlight: highlightId } = useLocalSearchParams<{ album: IdType, highlight: IdType }>();
  const dispatch = useAppDispatch();
  const album = useAppSelector(state => getAlbumById(state, albumId))
  const [ dialogVisible, setDialogVisible ] = useState(false);
  const [ dialogError, setDialogError ] = useState(false);

  const [ contextDialogVisible, setContextDialogVisible ] = useState(false);
  const [ contextDialogError, setContextDialogError ] = useState(false);
  const [ contextDialogState, setContextDialogState ] = useState<ContextActions>("notchosen");
  const [ chosenFile, setChosenFile ] = useState<IdType | undefined>(undefined);

  const [ pickedFileUri, setPickedFileUri ] = useState<string>("");
  const [ pickedMediaType, setPickedMediaType ] = useState<MediaTypes>("audio");
  const [ fileName, setFileName ] = useState<string>("");

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      const targetIndex = album?.files.findIndex(file => file.id === highlightId);

      if (targetIndex === -1 || targetIndex === undefined) return;

      try {
        flatListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: true,
          viewPosition: 0.5,
        });
        console.log(`Scrolled to index ${targetIndex}`);
      } catch (error) {
        console.error("Error scrolling to index:", error);
      }
    }, 500);

    return () => {
      console.log("Clearing scroll timeout");
      clearTimeout(timer);
    };
  }, [album, highlightId]);

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

  const handleSaveDialog = () => {
    if (fileName.trim() === "") {
      setDialogError(true);
      return;
    }

    dispatch(addFileToAlbum({
      albumId: album.id,
      name: fileName.trim(),
      uri: pickedFileUri,
      type: pickedMediaType,
    }));
    handleCancelDialog();
  };

  const handleCancelContextDialog = () => {
    setChosenFile(undefined);
    setContextDialogError(false);
    setContextDialogState("notchosen");
    setContextDialogVisible(false);
    setFileName("");
  };

  const handleRenameAlbum = () => {
    if (fileName.trim() === "") {
      setContextDialogError(true);
      return;
    }

    if (chosenFile !== undefined) {
      dispatch(renameFile({
        albumId: album.id,
        fileId: chosenFile,
        name: fileName.trim(),
      }));
    }

    handleCancelContextDialog();
  };

  const handleDeleteAlbum = () => {
    if (chosenFile !== undefined) {
      dispatch(removeFileFromAlbum({
        albumId: album.id,
        fileId: chosenFile
      }));
    }

    handleCancelContextDialog();
  };

  const handleQueue = () => {
    const file = album.files.find(f => f.id === chosenFile);

    if (file !== undefined) {
      dispatch(addToQueue({
        albumId: album.id,
        mediaFile: file,
      }));
    }
    
    handleCancelContextDialog();
  };

  const contextDialogContent: Record<ContextActions, () => React.ReactNode> = {
    rename: () => (
      <>
        <Dialog.Title title={albumModal.renameFile} />
        <Input
          placeholder={albumModal.inputPlaceholder}
          errorMessage={contextDialogError ? albumModal.inputError : undefined}
          onChangeText={setFileName}
        />
        <Dialog.Actions>
          <Dialog.Button title={albumModal.cancel} onPress={handleCancelContextDialog} />
          <Dialog.Button title={albumModal.rename} onPress={handleRenameAlbum} />
        </Dialog.Actions>
      </>
    ),
    delete: () => (
      <>
        <Dialog.Title title={albumModal.deleteFile} />
        <Text>{albumModal.areYouSure}</Text>
        <Dialog.Actions>
          <Dialog.Button title={albumModal.cancel} onPress={handleCancelContextDialog} />
          <Dialog.Button title={albumModal.delete} onPress={handleDeleteAlbum} />
        </Dialog.Actions>
      </>
    ),
    notchosen: () => (
      <>
        <Dialog.Title title={albumModal.contextTitle} />
        <Dialog.Actions>
          <Dialog.Button title={albumModal.cancel} onPress={handleCancelContextDialog} />
          <Dialog.Button title={albumModal.delete} onPress={() => setContextDialogState("delete")} />
          <Dialog.Button title={albumModal.rename} onPress={() => setContextDialogState("rename")} />
          <Dialog.Button title={albumModal.queue}  onPress={handleQueue} />
        </Dialog.Actions>
      </>
    ),
  };

  const contextInvoke = (fileId: IdType) => {
    setChosenFile(fileId);
    setContextDialogVisible(true);
  };

  const mediaPressHandler = (file: MediaFile) => {
    dispatch(setTrackAsync({
      track: {
        albumId: album.id,
        mediaFile: file
      },
      albumTracks: album.files.map(f => ({ albumId: album.id, mediaFile: f }))
    }));

    router.push('/');
  };

  return (
    <View className='flex-1 justify-center items-center p-2'>
      <View className="h-5/6 w-5/6 justify-center items-center rounded-3xl bg-blue-500 p-5">
        <FlatList
          ref={flatListRef}
          className='w-full'
          data={album.files}
          renderItem={
            ({ item: file }) => (FileCard({
              id: file.id,
              name: file.name,
              highlight: file.id === highlightId,
              cardClickCallback: () => mediaPressHandler(file),
              contextCallback: () => contextInvoke(file.id)
            }))
          }
          ItemSeparatorComponent={Seperator}
          ListEmptyComponent={NoFileFound}
          ListHeaderComponent={() => Header({ albumName: album.title })}
          keyExtractor={file => file.id}
        />
        <Button
          className='ml-auto w-10 h-10 justify-center items-center bg-slate-800 rounded-full'
          onPress={handleAddFile}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </Button>
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

      <Dialog
        isVisible={contextDialogVisible}
        onBackdropPress={handleCancelContextDialog}
      >
        {contextDialogContent[contextDialogState]()}
      </Dialog>
    </View>
  );
}