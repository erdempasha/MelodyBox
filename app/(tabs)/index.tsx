import React, { useEffect, useRef } from 'react';
import { View, Text, Button, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { loadStateForTesting, Album, MediaFile } from '@/redux/librarySlice';
import {
  Track,
  RepeatMode,
  setTrackAsync,
  playPauseAsync,
  nextTrackAsync,
  previousTrackAsync,
  toggleShuffle,
  setRepeatMode,
  selectPlayerState,
  reloadPersistedTrackAsync,
} from '@/redux/playerSlice';

const sampleLibraryState: { albums: Album[] } = {
  albums: [
    {
      id: 'album-1',
      title: 'Demo Audios',
      files: [
        { id: 'f1', name: 'Sample Audio 1', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'audio' as const },
        { id: 'f2', name: 'Sample Audio 2', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'audio' as const },
        { id: 'f3', name: 'Sample Audio 3', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', type: 'audio' as const },
      ],
      createdAt: Date.now() - 100000,
    },
    {
        id: 'album-2',
        title: 'Demo Videos (Placeholder URIs)',
        files: [
          { id: 'f4', name: 'Sample Video 1', uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'video' as const },
          { id: 'f5', name: 'Sample Video 2', uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', type: 'video' as const },
        ],
        createdAt: Date.now(),
      },
  ],
};

export default function PlayerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const albums = useSelector((state: RootState) => state.library.albums);
  const {
    currentTrack,
    playbackStatus,
    shuffle,
    repeatMode
  } = useSelector(selectPlayerState);

  const initialLoadAttempted = useRef(false);

  useEffect(() => {
    dispatch(loadStateForTesting(sampleLibraryState));

    if (!initialLoadAttempted.current && currentTrack && !playbackStatus.isLoaded) {
       console.log("Attempting initial reload of persisted track state...");
       dispatch(reloadPersistedTrackAsync());
    }
    initialLoadAttempted.current = true;

  }, [dispatch, currentTrack, playbackStatus.isLoaded]);


  const handlePlayTrack = (selectedFile: MediaFile, album: Album) => {
    const trackToPlay: Track = {
      albumId: album.id,
      mediaFile: selectedFile,
    };
    const albumTracks: Track[] = album.files.map(file => ({
      albumId: album.id,
      mediaFile: file,
    }));
    dispatch(setTrackAsync({ track: trackToPlay, albumTracks }));
  };

  const handlePlayPause = () => {
    dispatch(playPauseAsync());
  };

  const handleNext = () => {
    dispatch(nextTrackAsync());
  };

  const handlePrevious = () => {
    dispatch(previousTrackAsync());
  };

  const handleToggleShuffle = () => {
    dispatch(toggleShuffle());
  };

  const handleToggleRepeat = () => {
    const nextMode: RepeatMode = repeatMode === 'none' ? 'one' : 'none';
    dispatch(setRepeatMode(nextMode));
  };

  const renderTrackItem = ({ item: file, album }: { item: MediaFile, album: Album }) => (
    <Pressable key={file.id} onPress={() => handlePlayTrack(file, album)} style={styles.trackItem}>
      <Text style={currentTrack?.mediaFile.id === file.id ? styles.currentTrackText : styles.trackText}>
        {file.name} ({file.type})
      </Text>
    </Pressable>
  );

  const renderAlbumItem = ({ item: album }: { item: Album }) => (
    <View key={album.id} style={styles.albumContainer}>
      <Text style={styles.albumTitle}>{album.title}</Text>
      {album.files.map(file => renderTrackItem({ item: file, album }))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.playerControls}>
        <Text style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
            Now Playing: {currentTrack?.mediaFile.name ?? 'None'}
        </Text>
        <Text style={styles.statusText}>
            Status: {playbackStatus.isPlaying ? 'Playing' : playbackStatus.isLoaded ? 'Paused' : 'Stopped'}
            {playbackStatus.isBuffering ? ' (Buffering)' : ''}
        </Text>
        <Text style={styles.statusText}>
            Position: {Math.round(playbackStatus.positionMillis / 1000)}s / {playbackStatus.durationMillis ? Math.round(playbackStatus.durationMillis / 1000) : '--'}s
        </Text>
        {playbackStatus.error && <Text style={styles.errorText}>Error: {playbackStatus.error}</Text>}

        <View style={styles.buttonRow}>
          <Button title="Prev" onPress={handlePrevious} disabled={!playbackStatus.isLoaded} />
          <Button
            title={playbackStatus.isPlaying ? 'Pause' : 'Play'}
            onPress={handlePlayPause}
            disabled={!currentTrack || !playbackStatus.isLoaded} // Disable if no track loaded
          />
          <Button title="Next" onPress={handleNext} disabled={!playbackStatus.isLoaded} />
        </View>
        <View style={styles.buttonRow}>
           <Button
             title={`Shuffle: ${shuffle ? 'ON' : 'OFF'}`}
             onPress={handleToggleShuffle}
             color={shuffle ? 'dodgerblue' : 'gray'}
            />
           <Button
             title={`Repeat: ${repeatMode.toUpperCase()}`}
             onPress={handleToggleRepeat}
             color={repeatMode !== 'none' ? 'dodgerblue' : 'gray'}
           />
        </View>
      </View>

      <View style={styles.librarySection}>
        <Text style={styles.libraryTitle}>Library</Text>
        {albums.map(album => renderAlbumItem({ item: album }))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  playerControls: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
   errorText: {
    fontSize: 14,
    marginBottom: 5,
    color: 'red',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  librarySection: {
     marginTop: 10,
  },
  libraryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  albumContainer: {
    marginBottom: 15,
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingLeft: 5,
  },
  trackItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  trackText: {
    fontSize: 16,
  },
  currentTrackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'dodgerblue',
  },
});