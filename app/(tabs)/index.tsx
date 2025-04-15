import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesome6 } from '@expo/vector-icons';
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
  getAlbums,
  selectPlayerState
} from '@/redux/selectors';

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

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(playbackStatus.positionMillis);
    }
  }, [playbackStatus.positionMillis, isSeeking]);

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
    dispatch(previousTrackAsync());
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
          {currentTrack?.mediaFile.type === 'video' && (
            <Video
              ref={videoRef}
              className='flex-1 w-full bg-black'
              source={{ uri: currentTrack.mediaFile.uri }}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={playbackStatus.isPlaying}
              isLooping={repeatMode === 'one'}
              onPlaybackStatusUpdate={handleVideoStatusUpdate}
              onError={handleVideoError}
            />
          )}
          <Text className='absolute w-fit bottom-2 text-white bg-black/30 py-1 px-2 rounded text-center' numberOfLines={1} ellipsizeMode="tail">
             {currentTrack?.mediaFile.name ?? 'None'}
          </Text>
        </View>

        <View className='w-full p-2 bg-green-800 rounded-xl'>
            <View className='flex-row items-center w-full'>
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
              <LinkButton href="/test">
                <Text className="text-white p-3 font-bold">Admin Page</Text>
              </LinkButton>
            </View>

            <View className="flex-row justify-around mt-4">
              <Button
                onPress={handlePrevious}
                disabled={!currentTrack}
                className='w-10 h-10 justify-center items-center bg-slate-800 rounded-full'
              >
                <FontAwesome6 name='backward' />
              </Button>
              <Button
                onPress={handlePlayPause}
                disabled={!currentTrack}
                className='w-10 h-10 justify-center items-center bg-slate-800 rounded-full'
              >
                { playbackStatus.isPlaying ? <FontAwesome6 name='pause' />: <FontAwesome6 name='play' /> }
              </Button>
              <Button
                onPress={handleNext}
                disabled={!currentTrack}
                className='w-10 h-10 justify-center items-center bg-slate-800 rounded-full'
              >
                <FontAwesome6 name='forward' />
              </Button>
            </View>

            <View className="flex-row justify-around mt-4">
              <Button
                onPress={handleToggleShuffle}
                className='w-10 h-10 justify-center items-center bg-slate-800 rounded-full'
              >
                { shuffle? <FontAwesome6 name='shuffle' color="green" />: <FontAwesome6 name="shuffle" color="red" /> }
              </Button>
              <Button
                onPress={handleToggleRepeat}
                className='w-10 h-10 justify-center items-center bg-slate-800 rounded-full'
              >
                { repeatMode === 'none'? <FontAwesome6 name='repeat' color="red" />: <FontAwesome6 name='repeat' color="green" /> }
              </Button>
            </View>

        </View>
      </View>
    </View>
  );
}