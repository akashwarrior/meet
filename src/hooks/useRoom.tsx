import { useEffect, useRef } from "react";
import { ConnectionState, LocalParticipant, LocalTrackPublication, Participant, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, TrackPublication } from "livekit-client";
import { toast } from "sonner";
import useParticipantStore from "@/store/participant";
import useStreamTrackstore from "@/store/streamTrack";

export function useRoom({
    username,
    meetingId,
    isLoading,
    setIsLoading,
}: {
    username: string;
    meetingId: string;
    isLoading: "Loading" | "Connected" | "Disconnected";
    setIsLoading: (isLoading: "Loading" | "Connected" | "Disconnected") => void;
}) {
    const { addParticipant, removeParticipant } = useParticipantStore();
    const { updateTracks } = useStreamTrackstore();
    const roomRef = useRef<Room>(
        new Room({
            adaptiveStream: true,
            dynacast: true,
        })
    );

    useEffect(() => {
        if (isLoading !== "Loading") return;

        // Handlers ---
        const handleConnected = () => {
            const { sid, name } = roomRef.current.localParticipant;
            addParticipant({ sid, name });
        };

        const handleParticipantConnected = addParticipant;
        const handleParticipantDisconnected = removeParticipant;

        const handleTrackSubscribed = ({ mediaStreamTrack, kind }: RemoteTrack, _: RemoteTrackPublication, { sid }: RemoteParticipant) => {
            updateTracks({ track: { mediaStreamTrack, kind }, sid });
        };

        const handleTrackUnsubscribed = ({ kind }: RemoteTrack, _: RemoteTrackPublication, { sid }: RemoteParticipant) => {
            updateTracks({ track: { mediaStreamTrack: null, kind }, sid });
        };

        const handleTrackMuted = ({ kind }: TrackPublication, { sid }: Participant) => {
            updateTracks({
                track: {
                    mediaStreamTrack: null,
                    kind,
                },
                sid,
            });
        }

        const handleTrackUnmuted = ({ track, kind }: TrackPublication, { sid }: Participant) => {
            updateTracks({
                track: {
                    mediaStreamTrack: track?.mediaStreamTrack ?? null,
                    kind,
                },
                sid,
            });
        }

        const handleLocalTrackPublished = ({ track, kind }: LocalTrackPublication, { sid }: LocalParticipant) => {
            updateTracks({
                track: {
                    mediaStreamTrack: kind === "audio" ? null : track?.mediaStreamTrack ?? null,
                    kind,
                },
                sid,
            });
        };

        const handleLocalTrackUnpublished = ({ kind }: LocalTrackPublication, { sid }: LocalParticipant) => {
            updateTracks({ track: { mediaStreamTrack: null, kind }, sid });
        };

        const handleDisconnected = () => {
            roomRef.current.state = ConnectionState.Disconnected;
            roomRef.current.remoteParticipants.forEach(removeParticipant);
            setIsLoading("Disconnected");
        };

        // Attach listeners ---
        roomRef.current.on("connected", handleConnected);
        roomRef.current.on("participantConnected", handleParticipantConnected);
        roomRef.current.on("participantDisconnected", handleParticipantDisconnected);
        roomRef.current.on("trackSubscribed", handleTrackSubscribed);
        roomRef.current.on("trackMuted", handleTrackMuted);
        roomRef.current.on("trackUnmuted", handleTrackUnmuted);
        roomRef.current.on("trackUnsubscribed", handleTrackUnsubscribed);
        roomRef.current.on("localTrackPublished", handleLocalTrackPublished);
        roomRef.current.on("localTrackUnpublished", handleLocalTrackUnpublished);
        roomRef.current.on("disconnected", handleDisconnected);


        // Connect room ---
        (async () => {
            try {
                const res = await fetch(`/api/token?meetingId=${meetingId}&username=${username}`);
                const { token } = await res.json();
                if (token) {
                    await roomRef.current.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL as string, token);
                }
                roomRef.current.remoteParticipants.forEach(({ sid, name }) => {
                    addParticipant({ sid, name });
                });
                setIsLoading("Connected");
            } catch (e) {
                console.error(e);
                setIsLoading('Disconnected');
                toast.error("Failed to connect to the room");
                roomRef.current.disconnect();
            }
        })();
    }, [isLoading, roomRef]);

    return {
        room: roomRef.current,
        localParticipant: roomRef.current.localParticipant,
    };
}