import { Track } from "livekit-client"
import { create } from "zustand"

interface StreamTrackStore {
    videoTracks: { sid: string, track: MediaStreamTrack | null }[]
    audioTracks: { sid: string, track: MediaStreamTrack | null }[]
    updateTracks: ({ track, sid }: {
        track: {
            kind: Track.Kind
            mediaStreamTrack: MediaStreamTrack | null
        }, sid: string
    }) => void
}

const useStreamTrackstore = create<StreamTrackStore>()((set) => ({
    videoTracks: [],
    audioTracks: [],
    updateTracks: ({ track, sid }) => set((state) => {
        if (track?.kind === "video") {
            const updatedVideoTracks = state.videoTracks.filter(({ sid }) => sid !== sid);
            updatedVideoTracks.push({ sid, track: track.mediaStreamTrack });
            return { ...state, videoTracks: updatedVideoTracks };
        } else if (track?.kind === "audio") {
            const updatedAudioTracks = state.audioTracks.filter(({ sid }) => sid !== sid);
            updatedAudioTracks.push({ sid, track: track.mediaStreamTrack });
            return { ...state, audioTracks: updatedAudioTracks };
        }
        return state;
    }),
}))

export default useStreamTrackstore