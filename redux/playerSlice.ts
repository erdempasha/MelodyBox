import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AVPlaybackStatus, Audio, Video } from 'expo-av';
import { AppDispatch, RootState } from './store';
import { IdType, MediaFile } from "./librarySlice";

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

let soundObject: Audio.Sound | Video | null = null;
let currentOnStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

const playerService = {
  load: async (
    track: Track,
    initialStatus: { shouldPlay: boolean },
    onStatusUpdate: (status: AVPlaybackStatus) => void
  ): Promise<void> => {
    await playerService.unload();
    console.log(`PlayerService: Loading ${track.mediaFile.name}`);
    const isAudio = track.mediaFile.type === 'audio';
    const source = { uri: track.mediaFile.uri };
    const newSoundObject = isAudio ? new Audio.Sound() : new Video({});
    currentOnStatusUpdate = onStatusUpdate;
    newSoundObject.setOnPlaybackStatusUpdate(currentOnStatusUpdate);
    try {
      await newSoundObject.loadAsync(source, initialStatus);
      soundObject = newSoundObject;
      console.log(`PlayerService: Loaded ${track.mediaFile.name}`);
    } catch (error) {
      console.error("PlayerService: Error loading track", error);
      soundObject = null;
      newSoundObject.setOnPlaybackStatusUpdate(null);
      currentOnStatusUpdate = null;
      throw error;
    }
  },
  unload: async (): Promise<void> => {
    if (soundObject) {
      console.log("PlayerService: Unloading current sound object.");
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
        console.error("PlayerService: Error unloading", error);
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
      console.error("PlayerService: Error playing", error);
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
      console.error("PlayerService: Error pausing", error);
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
      console.error("PlayerService: Error seeking", error);
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
      console.error("PlayerService: Error replaying", error);
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
    const { repeatMode } = getState().player;
    if (repeatMode === 'one') {
      dispatch(replayAsync());
    } else {
       dispatch(nextTrackAsync());
    }
  }
);

export const setTrackAsync = createAsyncThunk<
  void, { track: Track; albumTracks: Track[] }, { dispatch: AppDispatch; state: RootState }
>(
  'player/setTrackAsync',
  async ({ track, albumTracks }, { dispatch }) => {
    dispatch(playerSlice.actions._setTrackInternal({ track, albumTracks }));
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
  }
);

export const playPauseAsync = createAsyncThunk<
  void, void, { state: RootState }
>(
  'player/playPauseAsync',
  async (_, { getState }) => {
    const { isPlaying, isLoaded } = getState().player.playbackStatus;
    if (!isLoaded) return;
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
    const { isLoaded } = getState().player.playbackStatus;
    if (!isLoaded) return;
    await playerService.seek(positionMillis);
  }
);

export const replayAsync = createAsyncThunk<
  void, void, { state: RootState }
>(
  'player/replayAsync',
  async (_, { getState }) => {
    const { isLoaded } = getState().player.playbackStatus;
    if (!isLoaded) return;
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
    let sourceQueue: Track[] = [];

    if (state.shuffle) {
        const availableQueues: { type: 'next' | 'queue' | 'album'; queue: Track[] }[] = [];
        if (state.next.length > 0) availableQueues.push({ type: 'next', queue: [...state.next] });
        if (state.queue.length > 0) availableQueues.push({ type: 'queue', queue: [...state.queue] });
        if (state.albumQueue.length > 0) availableQueues.push({ type: 'album', queue: [...state.albumQueue] });

        if (availableQueues.length > 0) {
            const target = availableQueues[0];
            sourceQueueType = target.type;
            sourceQueue = target.queue;
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
        const onStatusUpdate = (status: AVPlaybackStatus) => {
            dispatch(playerSlice.actions._updatePlaybackStatusInternal(status));
            if (status.isLoaded && status.didJustFinish) {
                dispatch(handleTrackFinishAsync());
            }
        };
        try {
            await playerService.load(chosenTrack, { shouldPlay: true }, onStatusUpdate);
        } catch (error: any) {
            dispatch(playerSlice.actions._updatePlaybackStatusInternal({ isLoaded: false, error: error?.message || 'Failed to load next track' }));
            dispatch(stopPlaybackAsync());
        }
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

    if (positionMillis > seekThreshold) {
      await playerService.seek(0);
    } else if (state.prev.length > 0) {
      const previousTrack = state.prev[0];
      dispatch(playerSlice.actions._setPreviousTrackInternal({ currentTrackToShiftToNext: currentTrack }));
      const onStatusUpdate = (status: AVPlaybackStatus) => {
            dispatch(playerSlice.actions._updatePlaybackStatusInternal(status));
            if (status.isLoaded && status.didJustFinish) {
                dispatch(handleTrackFinishAsync());
            }
       };
      try {
        await playerService.load(previousTrack, { shouldPlay: true }, onStatusUpdate);
      } catch (error: any) {
        dispatch(playerSlice.actions._updatePlaybackStatusInternal({ isLoaded: false, error: error?.message || 'Failed to load previous track' }));
        dispatch(stopPlaybackAsync());
      }
    } else {
      await playerService.seek(0);
    }
  }
);

//!
export const reloadPersistedTrackAsync = createAsyncThunk<
  void, void, { dispatch: AppDispatch; state: RootState }
>(
  'player/reloadPersistedTrackAsync',
  async (_, { dispatch, getState }) => {
    const { currentTrack, playbackStatus } = getState().player;

    // Only proceed if a track was persisted but is not currently loaded
    if (!currentTrack || playbackStatus.isLoaded) {
      return;
    }
    console.log('Attempting to reload persisted track:', currentTrack.mediaFile.name);

    const onStatusUpdate = (status: AVPlaybackStatus) => {
       dispatch(playerSlice.actions._updatePlaybackStatusInternal(status));
       // NOTE: We don't trigger handleTrackFinishAsync from here
       // because this is just a load, not natural playback finishing.
    };

    try {
      // Load the track but ensure it doesn't auto-play
      await playerService.load(currentTrack, { shouldPlay: false }, onStatusUpdate);
      // Ensure the state reflects that it's loaded but not playing
      dispatch(playerSlice.actions._syncStatusAfterPersistedLoad());
    } catch (error: any) {
      console.error('Failed to reload persisted track:', error);
      dispatch(playerSlice.actions._updatePlaybackStatusInternal({ isLoaded: false, error: error?.message || 'Failed to reload track' }));
      // Optionally stop/clear state if reload fails critically
      // dispatch(stopPlaybackAsync());
    }
  }
);

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    _setTrackInternal: (state, action: PayloadAction<{ track: Track; albumTracks: Track[] }>) => {
      state.currentTrack = action.payload.track;
      state.albumQueue = action.payload.albumTracks.filter(t => t.mediaFile.id !== action.payload.track.mediaFile.id);
      state.queue = [];
      state.prev = [];
      state.next = [];
      state.playbackStatus = { ...initialState.playbackStatus, isLoaded: false };
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
        state.playbackStatus = { ...initialState.playbackStatus, isLoaded: false };
    },
    _setPreviousTrackInternal: (state, action: PayloadAction<{currentTrackToShiftToNext: Track}>) => {
        if (state.prev.length > 0) {
           state.next.unshift(action.payload.currentTrackToShiftToNext);
           state.currentTrack = state.prev.shift();
           state.playbackStatus = { ...initialState.playbackStatus, isLoaded: false };
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
      if (state.playbackStatus.isLoaded) {
         state.playbackStatus.isPlaying = false;
         state.playbackStatus.didJustFinish = false;
      }
    },
  },
});

export const {
  addToQueue,
  clearQueue,
  setRepeatMode,
  toggleShuffle,
} = playerSlice.actions;

export default playerSlice.reducer;

export const selectCurrentTrack = (state: RootState) => state.player.currentTrack;
export const selectPlaybackStatus = (state: RootState) => state.player.playbackStatus;
export const selectPlayerState = (state: RootState) => state.player;