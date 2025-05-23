import { Album, LibraryState } from "@/redux/librarySlice"

export const fakeLibraryData: LibraryState = {
  albums: [
    {
      id: "Album_0",
      title: "Chill Vibes",
      createdAt: 1682000000000,
      files: [
        {
          id: "File_0_0",
          name: "Sunset Boulevard",
          uri: "file:///data/user/0/host.exp.exponent/files/ExperienceData/%40user%2Fmyapp/audio/sunset_boulevard.mp3",
          type: "audio",
          playCount: 0,
          favourited: false,
        },
        {
          id: "File_0_1",
          name: "Late Night Walk",
          uri: "file:///data/user/0/host.exp.exponent/files/ExperienceData/%40user%2Fmyapp/audio/late_night_walk.mp3",
          type: "audio",
          playCount: 0,
          favourited: false,
        },
      ],
    },
    {
      id: "Album_1",
      title: "Workout Mix",
      createdAt: 1682100000000,
      files: [
        {
          id: "File_1_0",
          name: "Push Harder",
          uri: "file:///data/user/0/host.exp.exponent/files/ExperienceData/%40user%2Fmyapp/audio/push_harder.mp3",
          type: "audio",
          playCount: 0,
          favourited: false,
        },
        {
          id: "File_1_1",
          name: "Final Sprint",
          uri: "file:///data/user/0/host.exp.exponent/files/ExperienceData/%40user%2Fmyapp/audio/final_sprint.mp3",
          type: "audio",
          playCount: 0,
          favourited: false,
        },
      ],
    },
    {
      id: "Album_2",
      title: "My Videos",
      createdAt: 1682200000000,
      files: [
        {
          id: "File_2_0",
          name: "Vacation Highlights",
          uri: "file:///data/user/0/host.exp.exponent/files/ExperienceData/%40user%2Fmyapp/videos/vacation_highlights.mp4",
          type: "video",
          playCount: 0,
          favourited: false,
        },
        {
          id: "File_2_1",
          name: "Birthday Bash",
          uri: "file:///data/user/0/host.exp.exponent/files/ExperienceData/%40user%2Fmyapp/videos/birthday_bash.mp4",
          type: "video",
          playCount: 0,
          favourited: false,
        },
      ],
    },
    {
      id: "Album_3",
      title: "Mixed Media",
      createdAt: 1682300000000,
      files: [
        {
          id: "File_3_0",
          name: "Podcast Episode 1",
          uri: "file:///data/user/0/host.exp.exponent/files/ExperienceData/%40user%2Fmyapp/audio/podcast_ep1.mp3",
          type: "audio",
          playCount: 0,
          favourited: false,
        },
        {
          id: "File_3_1",
          name: "Dance Tutorial",
          uri: "file:///data/user/0/host.exp.exponent/files/ExperienceData/%40user%2Fmyapp/videos/dance_tutorial.mp4",
          type: "video",
          playCount: 0,
          favourited: false,
        },
      ],
    },
  ],
};

export const sampleLibraryState: { albums: Album[] } = {
  albums: [
    {
      id: 'album-1',
      title: 'Demo Audios',
      files: [
        { id: 'f1', name: 'Sample Audio 1', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'audio' as const, playCount: 0, favourited: false },
        { id: 'f2', name: 'Sample Audio 2', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'audio' as const, playCount: 0, favourited: false },
        { id: 'f3', name: 'Sample Audio 3', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', type: 'audio' as const, playCount: 0, favourited: false },
      ],
      createdAt: Date.now() - 100000,
    },
    {
        id: 'album-2',
        title: 'Demo Videos',
        files: [
          { id: 'f4', name: 'Big Buck Bunny', uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'video' as const, playCount: 0, favourited: false },
          { id: 'f5', name: 'Elephants Dream', uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', type: 'video' as const, playCount: 0, favourited: false },
        ],
        createdAt: Date.now(),
      },
  ],
};