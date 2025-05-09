import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Codecs = 'vp8' | 'h264' | 'vp9' | 'av1';

interface VideoPrefs {
    videoResolution: {
        width: number;
        height: number;
    };
    videoFrames: number;
    videoCodec: Codecs;
    backgroundBlur: boolean;
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
                videoResolution: {
                    width: 1920,
                    height: 1080,
                },
                videoFrames: 30,
                videoCodec: 'vp8',
                backgroundBlur: false,
            },
            meeting: {
                isVideoEnabled: false,
                isAudioEnabled: false,
            },

            setVideoPrefs: (videoPrefs) =>
                set((state) => ({
                    video: { ...(state.video), ...videoPrefs },
                })),

            setMeetingPrefs: (meetingPrefs) =>
                set((state) => ({
                    meeting: { ...state.meeting, ...meetingPrefs },
                })),
        }),
        {
            name: "meeting-prefs-storage", // key in localStorage
        }
    )
);

export default useMeetingPrefsStore;