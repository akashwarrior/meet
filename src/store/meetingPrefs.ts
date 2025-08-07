import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Codecs = "vp8" | "h264" | "vp9" | "av1";

interface VideoPrefs {
  resolution?: {
    width: number;
    height: number;
    frameRate?: number;
  };
  facingMode: "user" | "environment" | "left" | "right";
  videoCodec: Codecs;
}

interface MeetingPrefs {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

interface MeetingPrefsState {
  video: VideoPrefs;
  meeting: MeetingPrefs;
  setVideoPrefs: (videoPrefs: Partial<VideoPrefs>) => void;
  setMeetingPrefs: (meetingPrefs: Partial<MeetingPrefs>) => void;
}

const useMeetingPrefsStore = create<MeetingPrefsState>()(
  persist(
    (set) => ({
      video: {
        facingMode: "user",
        videoCodec: "vp8",
      },
      meeting: {
        isVideoEnabled: false,
        isAudioEnabled: false,
      },

      setVideoPrefs: (videoPrefs) =>
        set((state) => ({
          video: { ...state.video, ...videoPrefs },
        })),

      setMeetingPrefs: (meetingPrefs) =>
        set((state) => ({
          meeting: { ...state.meeting, ...meetingPrefs },
        })),
    }),
    {
      name: "meeting-prefs-storage", // key in localStorage
    },
  ),
);

export default useMeetingPrefsStore;
