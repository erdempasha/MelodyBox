import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import Slider from '@react-native-community/slider';

import { Button } from '@/components/Button';
import { LinkButton } from '@/components/LinkButton';

import { AppDispatch, RootState } from '@/redux/store';
import {
  Album,
  MediaFile
} from '@/redux/librarySlice';
import {
  RepeatMode,
  playPauseAsync,
  nextTrackAsync,
  previousTrackAsync,
  toggleShuffle,
  setRepeatMode,
  reloadPersistedTrackAsync,
  handleTrackFinishAsync,
  _updatePlaybackStatusInternal,
  seekAsync,
} from '@/redux/playerSlice';
import {
  getAlbums,
  selectPlayerState
} from '@/redux/selectors';

import { playerScreen } from '@/constants/strings';

import "@/global.css";


export default function Player() {
  const dispatch = useDispatch<AppDispatch>();
  const albums = useSelector(getAlbums);
  const {
    currentTrack,
    playbackStatus,
    shuffle,
    repeatMode
  } = useSelector(selectPlayerState);
  
  const videoRef = useRef<Video>(null);
  
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const [ actionFlag, setActionFlag ] = useState(true);

  useEffect(() => {
    if (currentTrack) {
      console.log("Attempting initial reload check...");
      dispatch(reloadPersistedTrackAsync());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(playbackStatus.positionMillis);
    }
  }, [playbackStatus.positionMillis, isSeeking]);

  const handlePlayPause = async () => {
    if (!actionFlag) return;
    setActionFlag(false);

    if (!currentTrack) return;

    if (currentTrack.mediaFile.type === 'audio') {
      await dispatch(playPauseAsync());
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

    setActionFlag(true);
  };

  const handleNext = async () => {
    if (!actionFlag) return;
    setActionFlag(false);

    await dispatch(nextTrackAsync());

    setActionFlag(true);
  };

  const handlePrevious = async () => {
    if (!actionFlag) return;
    setActionFlag(false);

    await dispatch(previousTrackAsync());
    
    setActionFlag(true);
  };

  const handleSeek = async (positionMillis: number) => {
    if (!actionFlag) return;
    setActionFlag(false);

    if (!currentTrack || !playbackStatus.isLoaded) return;

    const clampedPosition = Math.max(0, Math.min(positionMillis, playbackStatus.durationMillis ?? positionMillis));
    console.log(`Seeking to: ${clampedPosition}`);
    
    if (currentTrack.mediaFile.type === 'audio') {
        await dispatch(seekAsync({ positionMillis: clampedPosition }));
    } else if (currentTrack.mediaFile.type === 'video') {
        await videoRef.current?.setPositionAsync(clampedPosition, { toleranceMillisBefore: 100, toleranceMillisAfter: 100 });
    }

    setActionFlag(true);
  };

  const handleToggleShuffle = () => {
    if (!actionFlag) return;
    setActionFlag(false);

    dispatch(toggleShuffle());

    setActionFlag(true);
  };

  const handleToggleRepeat = () => {
    if (!actionFlag) return;
    setActionFlag(false);

    const nextMode: RepeatMode = repeatMode === 'none' ? 'one' : 'none';
    dispatch(setRepeatMode(nextMode));
    if (currentTrack?.mediaFile.type === 'video') {
        videoRef.current?.setIsLoopingAsync(nextMode === 'one');
    }

    setActionFlag(true);
  };

  const handleVideoStatusUpdate = (status: AVPlaybackStatus) => {
    const { isLoaded } = status;
    if (isLoaded === null || isLoaded === undefined) {
      return;
    }
    dispatch(_updatePlaybackStatusInternal(status));
    if (status.isLoaded && status.didJustFinish) {
        console.log("Video finished playing.");
        dispatch(handleTrackFinishAsync());
    }
  };

  const formatTime = (millis: number | undefined | null): string => {
    if (millis === null || typeof millis === 'undefined' || isNaN(millis) || millis < 0) {
        return '00:00';
    }
    const totalSeconds = Math.floor(millis / 1000);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleVideoError = (error: string) => {
    console.error("Video Error:", error);
    dispatch(_updatePlaybackStatusInternal({
      isLoaded: false,
      error: error
    }));
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="h-5/6 w-5/6 justify-between items-center rounded-3xl bg-green-600 p-4">
        <View className="flex-1 w-full justify-center items-center bg-green-800 mb-4 overflow-hidden rounded-xl">
          {
            currentTrack?.mediaFile.type === 'video' ?
            <Video
              ref={videoRef}
              style={{flex: 1, backgroundColor: "black", width: '100%', height: "auto"}}
              source={{ uri: currentTrack.mediaFile.uri }}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={repeatMode === 'one'}
              onPlaybackStatusUpdate={handleVideoStatusUpdate}
              onError={handleVideoError}
            />:
            currentTrack?.mediaFile.type === 'audio' ?
            <Ionicons name='musical-notes' size={54} style={{ opacity: 0.5 }} />:
            <Text
              className='text-black/55 text-2xl font-bold'
            >
              {playerScreen.message}
            </Text>
          }
          {
            currentTrack?.mediaFile.name !== undefined ?
            <Text className='absolute w-fit bottom-2 text-white bg-black/30 py-1 px-2 rounded text-center' numberOfLines={1} ellipsizeMode="tail">
              {currentTrack?.mediaFile.name}
            </Text>:
            null
          }
        </View>

        <View className='w-full p-2 bg-green-800 rounded-xl'>
            <View className='flex-row mt-3 items-center w-full'>
                <Text className='text-white mx-3 text-center'>
                    {formatTime(isSeeking ? seekValue : playbackStatus.positionMillis)}
                </Text>

                <Slider
                    style={{ flex: 1 }}
                    minimumValue={0}
                    maximumValue={playbackStatus.durationMillis || 1}
                    value={isSeeking ? seekValue : playbackStatus.positionMillis}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#AAAAAA"
                    thumbTintColor="#FFFFFF"
                    disabled={!playbackStatus.isLoaded}
                    onValueChange={(value) => { setSeekValue(value); }}
                    onSlidingStart={(value) => { setIsSeeking(true); setSeekValue(value); }}
                    onSlidingComplete={(value) => { setIsSeeking(false); handleSeek(value); }}
                />

                <Text className=' text-white mx-3 text-center'>
                    {formatTime(playbackStatus.durationMillis)}
                </Text>
            </View>

            <View className="flex-row justify-around mt-4">
              <Button
                onPress={handlePrevious}
                disabled={!currentTrack || !actionFlag}
                className='w-12 h-12 justify-center items-center bg-slate-800 rounded-full'
              >
                <FontAwesome6 name='backward' size={20} />
              </Button>
              <Button
                onPress={handlePlayPause}
                disabled={!currentTrack  || !actionFlag}
                className='w-12 h-12 justify-center items-center bg-slate-800 rounded-full'
              >
                { playbackStatus.isPlaying ? <FontAwesome6 name='pause' size={20} />: <FontAwesome6 name='play' size={20} /> }
              </Button>
              <Button
                onPress={handleNext}
                disabled={!currentTrack  || !actionFlag}
                className='w-12 h-12 justify-center items-center bg-slate-800 rounded-full'
              >
                <FontAwesome6 name='forward' size={20} />
              </Button>
            </View>

            <View className="flex-row justify-around mt-4">
              <Button
                onPress={handleToggleShuffle}
                className='w-12 h-12 justify-center items-center bg-slate-800 rounded-full'
              >
                { shuffle? <FontAwesome6 name='shuffle' size={20} color="green" />: <FontAwesome6 name="shuffle" size={20} color="red" /> }
              </Button>
              <Button
                onPress={handleToggleRepeat}
                className='w-12 h-12 justify-center items-center bg-slate-800 rounded-full'
              >
                { repeatMode === 'none'? <FontAwesome6 name='repeat' size={20} color="red" />: <FontAwesome6 name='repeat' size={20} color="green" /> }
              </Button>
            </View>

        </View>
      </View>
    </View>
  );
}