import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Codecs = "vp8" | "h264" | "vp9" | "av1";
export type FacingMode = "user" | "environment" | "left" | "right";
export type VideoResolution = {
  width: number;
  height: number;
  frameRate?: number;
};

interface VideoPrefsPatch {
  resolution?: VideoResolution;
  facingMode?: FacingMode;
  videoCodec?: Codecs;
}

interface MeetingPrefsState {
  resolution?: VideoResolution;
  facingMode: FacingMode;
  videoCodec: Codecs;
  setVideoPrefs: (videoPrefs: VideoPrefsPatch) => void;
}

const useMeetingPrefsStore = create<MeetingPrefsState>()(
  persist(
    (set) => ({
      facingMode: "user",
      videoCodec: "vp8",

      setVideoPrefs: (videoPrefs) =>
        set(() => ({
          ...videoPrefs,
        })),
    }),
    {
      name: "meeting-prefs-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resolution: state.resolution,
        facingMode: state.facingMode,
        videoCodec: state.videoCodec,
      }),
    },
  ),
);

export default useMeetingPrefsStore;
