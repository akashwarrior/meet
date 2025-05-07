import { create } from 'zustand'

interface ParticipantStore {
    participants: { sid: string, name?: string }[]
    addParticipant: ({ sid, name }: { sid: string, name?: string }) => void
    removeParticipant: ({ sid }: { sid: string }) => void
}

const useParticipantStore = create<ParticipantStore>()((set) => ({
    participants: [],
    videoTracks: [],
    audioTracks: [],
    addParticipant: (participant) => set((state) => ({
        participants: [...state.participants, participant]
    })),
    removeParticipant: ({ sid }) => set((state) => ({ participants: state.participants.filter((p) => p.sid !== sid) })),
}))

export default useParticipantStore;