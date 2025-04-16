import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { AVPlaybackStatus, Audio } from 'expo-av';
import { AppDispatch, RootState } from './store';
import { IdType, MediaFile, MediaTypes } from "./librarySlice";

export interface Track {
  albumId: IdType;
  mediaFile: MediaFile;
}

export interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  didJustFinish: boolean;
  positionMillis: number;
  durationMillis?: number;
  error?: string;
}

export type RepeatMode = 'none' | 'one';

export interface PlayerState {
  currentTrack?: Track;
  playbackStatus: PlaybackStatus;
  albumQueue: Track[];
  queue: Track[];
  prev: Track[];
  next: Track[];
  repeatMode: RepeatMode;
  shuffle: boolean;
}

const initialState: PlayerState = {
  currentTrack: undefined,
  playbackStatus: {
    isLoaded: false,
    isPlaying: false,
    isBuffering: false,
    didJustFinish: false,
    positionMillis: 0,
    durationMillis: undefined,
    error: undefined,
  },
  albumQueue: [],
  queue: [],
  prev: [],
  next: [],
  repeatMode: "none",
  shuffle: false,
};

let soundObject: Audio.Sound | null = null;
let currentOnStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

const playerService = {
  load: async (
    track: Track,
    initialStatus: { shouldPlay: boolean },
    onStatusUpdate: (status: AVPlaybackStatus) => void
  ): Promise<void> => {
    await playerService.unload();
    console.log(`PlayerService: Loading AUDIO ${track.mediaFile.name}`);
    if (track.mediaFile.type !== 'audio') {
        console.warn("PlayerService.load called with non-audio track. Ignoring.");
        return;
    }
    const source = { uri: track.mediaFile.uri };
    const newSoundObject = new Audio.Sound();
    currentOnStatusUpdate = onStatusUpdate;
    newSoundObject.setOnPlaybackStatusUpdate(currentOnStatusUpdate);
    try {
      await newSoundObject.loadAsync(source, initialStatus);
      soundObject = newSoundObject;
      console.log(`PlayerService: Loaded AUDIO ${track.mediaFile.name}`);
    } catch (error) {
      console.error("PlayerService: Error loading audio track", error);
      soundObject = null;
      newSoundObject.setOnPlaybackStatusUpdate(null);
      currentOnStatusUpdate = null;
      throw error;
    }
  },
  unload: async (): Promise<void> => {
    if (soundObject) {
      console.log("PlayerService: Unloading current audio sound object.");
      const oldSoundObject = soundObject;
      const oldCallback = currentOnStatusUpdate;
      soundObject = null;
      currentOnStatusUpdate = null;
      try {
         if (oldCallback && typeof oldSoundObject.setOnPlaybackStatusUpdate === 'function') {
            oldSoundObject.setOnPlaybackStatusUpdate(null);
         }
        await oldSoundObject.unloadAsync();
      } catch (error) {
        console.error("PlayerService: Error unloading audio", error);
      }
    }
  },
  play: async (): Promise<void> => {
    if (!soundObject) return;
    try {
      const status = await soundObject.getStatusAsync();
      if (status?.isLoaded && !status.isPlaying) {
        await soundObject.playAsync();
      }
    } catch (error) {
      console.error("PlayerService: Error playing audio", error);
    }
  },
  pause: async (): Promise<void> => {
    if (!soundObject) return;
    try {
      const status = await soundObject.getStatusAsync();
      if (status?.isLoaded && status.isPlaying) {
        await soundObject.pauseAsync();
      }
    } catch (error) {
      console.error("PlayerService: Error pausing audio", error);
    }
  },
  seek: async (positionMillis: number): Promise<void> => {
    if (!soundObject) return;
    try {
      const status = await soundObject.getStatusAsync();
      if (status?.isLoaded) {
        await soundObject.setPositionAsync(positionMillis, { toleranceMillisBefore: 100, toleranceMillisAfter: 100 });
      }
    } catch (error) {
      console.error("PlayerService: Error seeking audio", error);
    }
  },
  replay: async (): Promise<void> => {
    if (!soundObject) return;
    try {
      const status = await soundObject.getStatusAsync();
      if (status?.isLoaded) {
        await soundObject.replayAsync({ shouldPlay: true });
      }
    } catch (error) {
      console.error("PlayerService: Error replaying audio", error);
    }
  },
};

export const stopPlaybackAsync = createAsyncThunk<
  void, void, { dispatch: AppDispatch }
>(
  'player/stopPlaybackAsync',
  async (_, { dispatch }) => {
    await playerService.unload();
    dispatch(playerSlice.actions._handleEndOfQueues());
  }
);

export const handleTrackFinishAsync = createAsyncThunk<
  void, void, { dispatch: AppDispatch; state: RootState }
>(
  'player/handleTrackFinishAsync',
  async (_, { dispatch, getState }) => {
    const { repeatMode, currentTrack } = getState().player;
    if (repeatMode === 'one' && currentTrack?.mediaFile.type === 'audio') {
      dispatch(replayAsync());
    } else if (repeatMode !== 'one') {
       dispatch(nextTrackAsync());
    }
  }
);

export const setTrackAsync = createAsyncThunk<
  void, { track: Track; albumTracks: Track[] }, { dispatch: AppDispatch; state: RootState }
>(
  'player/setTrackAsync',
  async ({ track, albumTracks }, { dispatch, getState }) => {
    await playerService.unload();
    dispatch(playerSlice.actions._setTrackInternal({ track, albumTracks }));

    if (track.mediaFile.type === 'audio') {
        const onStatusUpdate = (status: AVPlaybackStatus) => {
           dispatch(playerSlice.actions._updatePlaybackStatusInternal(status));
           if (status.isLoaded && status.didJustFinish) {
               dispatch(handleTrackFinishAsync());
           }
        };
        try {
          await playerService.load(track, { shouldPlay: true }, onStatusUpdate);
        } catch (error: any) {
          dispatch(playerSlice.actions._updatePlaybackStatusInternal({ isLoaded: false, error: error?.message || 'Failed to load track' }));
          dispatch(stopPlaybackAsync());
        }
    } else {
        dispatch(playerSlice.actions._syncStatusForVideoLoad());
        console.log("Set track for VIDEO. UI component should handle loading.");
    }
  }
);

export const reloadPersistedTrackAsync = createAsyncThunk<
  void, void, { dispatch: AppDispatch; state: RootState }
>(
  'player/reloadPersistedTrackAsync',
  async (_, { dispatch, getState }) => {
    const { currentTrack, playbackStatus } = getState().player;
    if (!currentTrack || playbackStatus.isLoaded) {
      return;
    }

    if (currentTrack.mediaFile.type === 'audio') {
        console.log('Attempting to reload persisted AUDIO track:', currentTrack.mediaFile.name);
        const onStatusUpdate = (status: AVPlaybackStatus) => {
           dispatch(playerSlice.actions._updatePlaybackStatusInternal(status));
        };
        try {
          await playerService.load(currentTrack, { shouldPlay: false }, onStatusUpdate);
          dispatch(playerSlice.actions._syncStatusAfterPersistedLoad());
        } catch (error: any) {
          console.error('Failed to reload persisted audio track:', error);
          dispatch(playerSlice.actions._updatePlaybackStatusInternal({ isLoaded: false, error: error?.message || 'Failed to reload track' }));
        }
    } else {
         console.log('Persisted track is VIDEO. Ensuring state is ready for component load.');
         dispatch(playerSlice.actions._syncStatusAfterPersistedLoad());
    }
  }
);

export const playPauseAsync = createAsyncThunk<
  void, void, { state: RootState }
>(
  'player/playPauseAsync',
  async (_, { getState }) => {
    const { playbackStatus: { isPlaying, isLoaded }, currentTrack } = getState().player;
    if (!isLoaded || !currentTrack || currentTrack.mediaFile.type !== 'audio') return;
    if (isPlaying) {
      await playerService.pause();
    } else {
      await playerService.play();
    }
  }
);

export const seekAsync = createAsyncThunk<
  void, { positionMillis: number }, { state: RootState }
>(
  'player/seekAsync',
  async ({ positionMillis }, { getState }) => {
     const { playbackStatus: { isLoaded }, currentTrack } = getState().player;
     if (!isLoaded || !currentTrack || currentTrack.mediaFile.type !== 'audio') return;
     await playerService.seek(positionMillis);
  }
);

export const replayAsync = createAsyncThunk<
  void, void, { state: RootState }
>(
  'player/replayAsync',
  async (_, { getState }) => {
    const { playbackStatus: { isLoaded }, currentTrack } = getState().player;
    if (!isLoaded || !currentTrack || currentTrack.mediaFile.type !== 'audio') return;
    await playerService.replay();
  }
);

export const nextTrackAsync = createAsyncThunk<
  void, void, { dispatch: AppDispatch; state: RootState }
>(
  'player/nextTrackAsync',
  async (_, { dispatch, getState }) => {
    const state = getState().player;
    const currentTrack = state.currentTrack;
    if (!currentTrack) return;

    let chosenTrack: Track | undefined = undefined;
    let sourceQueueType: 'next' | 'queue' | 'album' = 'next';

    if (state.shuffle) {
        const availableQueues: { type: 'next' | 'queue' | 'album'; queue: Track[] }[] = [];
        if (state.next.length > 0) availableQueues.push({ type: 'next', queue: [...state.next] });
        if (state.queue.length > 0) availableQueues.push({ type: 'queue', queue: [...state.queue] });
        if (state.albumQueue.length > 0) availableQueues.push({ type: 'album', queue: [...state.albumQueue] });

        if (availableQueues.length > 0) {
            const target = availableQueues[0];
            sourceQueueType = target.type;
            const sourceQueue = target.queue;
            const randomIndex = Math.floor(Math.random() * sourceQueue.length);
            chosenTrack = sourceQueue[randomIndex];
        }
    } else {
        if (state.next.length > 0) {
            sourceQueueType = 'next';
            chosenTrack = state.next[0];
        } else if (state.queue.length > 0) {
            sourceQueueType = 'queue';
            chosenTrack = state.queue[0];
        } else if (state.albumQueue.length > 0) {
            sourceQueueType = 'album';
            chosenTrack = state.albumQueue[0];
        }
    }

    if (chosenTrack) {
        dispatch(playerSlice.actions._setNextTrackInternal({
            previousTrack: currentTrack,
            chosenTrack: chosenTrack,
            sourceQueueType: sourceQueueType,
        }));
        dispatch(setTrackAsync({ track: chosenTrack, albumTracks: [] }));
    } else {
        dispatch(stopPlaybackAsync());
    }
  }
);

export const previousTrackAsync = createAsyncThunk<
  void, void, { dispatch: AppDispatch; state: RootState }
>(
  'player/previousTrackAsync',
  async (_, { dispatch, getState }) => {
    const state = getState().player;
    const currentTrack = state.currentTrack;
    const positionMillis = state.playbackStatus.positionMillis;
    const seekThreshold = 3000;

    if (!currentTrack || !state.playbackStatus.isLoaded) return;

    if (positionMillis > seekThreshold && currentTrack.mediaFile.type === 'audio') {
      await playerService.seek(0);
    } else if (positionMillis > seekThreshold && currentTrack.mediaFile.type === 'video') {
       console.warn("Seek within video track via previous action not implemented via service. UI should handle.");
    } else if (state.prev.length > 0) {
      const previousTrack = state.prev[0];
      dispatch(playerSlice.actions._setPreviousTrackInternal({ currentTrackToShiftToNext: currentTrack }));
      dispatch(setTrackAsync({ track: previousTrack, albumTracks: [] }));
    } else if (currentTrack.mediaFile.type === 'audio') {
      await playerService.seek(0);
    } else {
       console.warn("Seek to 0 for video track via previous action not implemented via service. UI should handle.");
    }
    
  }
);

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    _setTrackInternal: (state, action: PayloadAction<{ track: Track; albumTracks: Track[] }>) => {
      state.currentTrack = action.payload.track;
      if (action.payload.albumTracks.length > 0) {
          state.albumQueue = action.payload.albumTracks.filter(t => t.mediaFile.id !== action.payload.track.mediaFile.id);
          state.queue = [];
          state.prev = [];
          state.next = [];
      }
      state.playbackStatus = {
          ...initialState.playbackStatus,
          isLoaded: false,
          error: undefined,
          didJustFinish: false,
      };
    },
    _setNextTrackInternal: (state, action: PayloadAction<{ previousTrack: Track, chosenTrack: Track, sourceQueueType: 'next' | 'queue' | 'album'}>) => {
        const { previousTrack, chosenTrack, sourceQueueType } = action.payload;
        state.prev.unshift(previousTrack);
        state.currentTrack = chosenTrack;
        const trackIdToRemove = chosenTrack.mediaFile.id;
        if (sourceQueueType === 'next') {
             state.next = state.next.filter(t => t.mediaFile.id !== trackIdToRemove);
        } else if (sourceQueueType === 'queue') {
             state.queue = state.queue.filter(t => t.mediaFile.id !== trackIdToRemove);
        } else if (sourceQueueType === 'album') {
             state.albumQueue = state.albumQueue.filter(t => t.mediaFile.id !== trackIdToRemove);
        }
        state.playbackStatus = {
            ...initialState.playbackStatus,
            isLoaded: false,
            error: undefined,
            didJustFinish: false,
        };
    },
    _setPreviousTrackInternal: (state, action: PayloadAction<{currentTrackToShiftToNext: Track}>) => {
        if (state.prev.length > 0) {
           state.next.unshift(action.payload.currentTrackToShiftToNext);
           state.currentTrack = state.prev.shift();
           state.playbackStatus = {
               ...initialState.playbackStatus,
               isLoaded: false,
               error: undefined,
               didJustFinish: false,
            };
        }
    },
    _handleEndOfQueues: (state) => {
      state.currentTrack = undefined;
      state.playbackStatus = { ...initialState.playbackStatus };
    },
    addToQueue: (state, action: PayloadAction<Track>) => {
      state.queue.push(action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
    },
    setRepeatMode: (state, action: PayloadAction<RepeatMode>) => {
      state.repeatMode = action.payload;
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
    _updatePlaybackStatusInternal: (state, action: PayloadAction<AVPlaybackStatus>) => {
      const status = action.payload;
      if (!status) return;
      if (status.isLoaded) {
        state.playbackStatus = {
          isLoaded: true,
          isPlaying: status.isPlaying,
          isBuffering: status.isBuffering ?? false,
          didJustFinish: status.didJustFinish ?? false,
          positionMillis: status.positionMillis,
          durationMillis: status.durationMillis,
          error: undefined,
        };
      } else {
        if (state.playbackStatus.isLoaded || status.error) {
             state.playbackStatus = {
               ...initialState.playbackStatus,
               isLoaded: false,
               error: status.error,
             };
        }
      }
    },
    _syncStatusAfterPersistedLoad: (state) => {
      if (state.currentTrack) {
          state.playbackStatus.isPlaying = false;
          state.playbackStatus.didJustFinish = false;
      }
    },
    _syncStatusForVideoLoad: (state) => {
        state.playbackStatus = {
            ...initialState.playbackStatus,
            isLoaded: false,
            isPlaying: true,
            error: undefined,
            didJustFinish: false,
        };
    },
    resetPlayerState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: any) => {
      if (action.payload && action.payload.player && action.key === 'root') {
        const rehydratedPlayerState = action.payload.player as PlayerState;
        return {
          ...rehydratedPlayerState,
          playbackStatus: {
            ...rehydratedPlayerState.playbackStatus,
            isLoaded: false, 
            isPlaying: false,
            isBuffering: false, 
            didJustFinish: false,
            error: undefined,
          },
          isTransitioning: false,
        };
      }

      return state;
    });
  },
});

export const {
  addToQueue,
  clearQueue,
  setRepeatMode,
  toggleShuffle,
  resetPlayerState,
  _updatePlaybackStatusInternal,
} = playerSlice.actions;

export default playerSlice.reducer;