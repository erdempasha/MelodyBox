import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Slider from '@react-native-community/slider';

import { AppDispatch, RootState } from '@/redux/store';
import { loadStateForTesting, Album, MediaFile } from '@/redux/librarySlice';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import {
  Track,
  RepeatMode,
  setTrackAsync,
  playPauseAsync,
  nextTrackAsync,
  previousTrackAsync,
  toggleShuffle,
  setRepeatMode,
  reloadPersistedTrackAsync,
  stopPlaybackAsync,
  handleTrackFinishAsync,
  _updatePlaybackStatusInternal,
  seekAsync,
} from '@/redux/playerSlice';
import {
  selectPlayerState
} from '@/redux/selectors';

import { sampleLibraryState } from '@/constants/testData';

const formatTime = (millis: number | undefined | null): string => {
  if (millis === null || typeof millis === 'undefined' || isNaN(millis) || millis < 0) {
      return '00:00';
  }
  const totalSeconds = Math.floor(millis / 1000);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  return `${minutes}:${seconds}`;
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

  const videoRef = useRef<Video>(null);
  const initialLoadAttempted = useRef(false);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  //useEffect(() => {
  //  dispatch(loadStateForTesting(sampleLibraryState));
  //  if (!initialLoadAttempted.current && currentTrack) {
  //     console.log("Attempting initial reload check...");
  //     dispatch(reloadPersistedTrackAsync());
  //  }
  //  initialLoadAttempted.current = true;
  //}, [dispatch, currentTrack]);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(playbackStatus.positionMillis);
    }
  }, [playbackStatus.positionMillis, isSeeking]);

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

  const handlePlayPause = async () => {
    if (!currentTrack) return;
    if (currentTrack.mediaFile.type === 'audio') {
      dispatch(playPauseAsync());
    } else if (currentTrack.mediaFile.type === 'video') {
      if (!videoRef.current) return;
      try {
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded) {
            if (status.isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
        }
      } catch (error) {
          console.error("Error handling video play/pause:", error);
      }
    }
  };

  const handleNext = () => {
    dispatch(nextTrackAsync());
  };

  const handlePrevious = () => {
    // This thunk now handles seeking audio / triggering state change for video
    dispatch(previousTrackAsync());
    // If video seek (> threshold) is desired here, it needs specific UI handling
    // or modification of previousTrackAsync to signal seek intent differently.
  };

  const handleSeek = async (positionMillis: number) => {
    if (!currentTrack || !playbackStatus.isLoaded) return;
    const clampedPosition = Math.max(0, Math.min(positionMillis, playbackStatus.durationMillis ?? positionMillis));
    console.log(`Seeking to: ${clampedPosition}`);
    if (currentTrack.mediaFile.type === 'audio') {
        dispatch(seekAsync({ positionMillis: clampedPosition }));
    } else if (currentTrack.mediaFile.type === 'video') {
        await videoRef.current?.setPositionAsync(clampedPosition, { toleranceMillisBefore: 100, toleranceMillisAfter: 100 });
    }
  };

  const handleToggleShuffle = () => {
    dispatch(toggleShuffle());
  };

  const handleToggleRepeat = () => {
    const nextMode: RepeatMode = repeatMode === 'none' ? 'one' : 'none';
    dispatch(setRepeatMode(nextMode));
    if (currentTrack?.mediaFile.type === 'video') {
        videoRef.current?.setIsLoopingAsync(nextMode === 'one');
    }
  };

  const handleVideoStatusUpdate = (status: AVPlaybackStatus) => {
      dispatch(_updatePlaybackStatusInternal(status));
      if (status.isLoaded && status.didJustFinish) {
          console.log("Video finished playing.");
          dispatch(handleTrackFinishAsync());
      }
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
      <View style={styles.playerUIContainer}>
        {currentTrack?.mediaFile.type === 'video' && (
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: currentTrack.mediaFile.uri }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={playbackStatus.isPlaying}
            isLooping={repeatMode === 'one'}
            onPlaybackStatusUpdate={handleVideoStatusUpdate}
            onError={(error) => { console.error("Video Error:", error); dispatch(_updatePlaybackStatusInternal({isLoaded: false, error: error}))}}
          />
        )}

        <View style={styles.playerControls}>
          <Text style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
              Now Playing: {currentTrack?.mediaFile.name ?? 'None'} ({currentTrack?.mediaFile.type ?? ''})
          </Text>
          <Text style={styles.statusText}>
              Status: {playbackStatus.isPlaying ? 'Playing' : playbackStatus.isLoaded ? 'Paused' : 'Stopped'}
              {playbackStatus.isBuffering ? ' (Buffering)' : ''}
          </Text>

          <View style={styles.sliderContainer}>
            <Text style={styles.timeText}>
                {formatTime(isSeeking ? seekValue : playbackStatus.positionMillis)}
            </Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={playbackStatus.durationMillis || 1}
                value={isSeeking ? seekValue : playbackStatus.positionMillis}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#cccccc"
                thumbTintColor="#007AFF"
                disabled={!playbackStatus.isLoaded}
                onValueChange={(value) => {
                    setSeekValue(value);
                }}
                onSlidingStart={(value) => {
                    setIsSeeking(true);
                    setSeekValue(value);
                }}
                onSlidingComplete={(value) => {
                    setIsSeeking(false);
                    handleSeek(value);
                }}
            />
            <Text style={styles.timeText}>
                {formatTime(playbackStatus.durationMillis)}
            </Text>
          </View>
          {/* --- End Slider --- */}

          {playbackStatus.error && <Text style={styles.errorText}>Error: {playbackStatus.error}</Text>}

          <View style={styles.buttonRow}>
            <Button title="Prev" onPress={handlePrevious} disabled={!currentTrack} />
            <Button
              title={playbackStatus.isPlaying ? 'Pause' : 'Play'}
              onPress={handlePlayPause}
              disabled={!currentTrack || (!playbackStatus.isLoaded && currentTrack?.mediaFile.type === 'audio')}
            />
            <Button title="Next" onPress={handleNext} disabled={!currentTrack} />
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
  },
  playerUIContainer: {},
  video: {
    width: '100%',
    height: 250,
    backgroundColor: 'black',
  },
  playerControls: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginTop: 5,
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
     marginTop: 20,
     paddingHorizontal: 10,
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
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 5,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 5,
  },
  timeText: {
      fontSize: 12,
      color: '#555',
      minWidth: 40,
      textAlign: 'center',
  },
});
