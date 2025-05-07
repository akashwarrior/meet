import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Codecs = 'vp8' | 'h264' | 'vp9' | 'av1';

interface VideoPrefs {
    videoInputDevice: MediaDeviceInfo | null;
    videoResolution: {
        width: number;
        height: number;
    };
    videoFrames: number;
    videoCodec: Codecs;
    backgroundBlur: boolean;
}

interface AudioPrefs {
    audioInputDevice: MediaDeviceInfo | null;
    audioOutputDevice: MediaDeviceInfo | null;
}

interface MeetingPrefs {
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
}

interface MeetingPrefsState {
    video: VideoPrefs;
    audio: AudioPrefs;
    meeting: MeetingPrefs;
    setVideoPrefs: (videoPrefs: Partial<VideoPrefs>) => void;
    setAudioPrefs: (audioPrefs: Partial<AudioPrefs>) => void;
    setMeetingPrefs: (meetingPrefs: Partial<MeetingPrefs>) => void;
}


const useMeetingPrefsStore = create<MeetingPrefsState>()(
    persist(
        (set) => ({
            video: {
                videoInputDevice: null,
                videoResolution: {
                    width: 3840,
                    height: 2160,
                },
                videoFrames: 60,
                videoCodec: 'vp8',
                backgroundBlur: false,
            },
            audio: {
                audioInputDevice: null,
                audioOutputDevice: null,
            },
            meeting: {
                isVideoEnabled: false,
                isAudioEnabled: false,
            },

            setVideoPrefs: (videoPrefs) =>
                set((state) => ({
                    video: { ...(state.video), ...videoPrefs },
                })),

            setAudioPrefs: (audioPrefs) =>
                set((state) => ({
                    audio: { ...(state.audio), ...audioPrefs },
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