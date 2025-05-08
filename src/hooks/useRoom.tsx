import { useEffect, useRef } from "react";
import { Room } from "livekit-client";
import { toast } from "sonner";

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
    const roomRef = useRef<Room>(
        new Room({
            adaptiveStream: true,
            dynacast: true,
        })
    );

    useEffect(() => {
        if (isLoading !== "Loading") return;

        (async () => {
            try {
                const res = await fetch(`/api/token?meetingId=${meetingId}&username=${username}`);
                const data = await res.json();
                if (data.token) {
                    await roomRef.current.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL as string, data.token);
                    setIsLoading("Connected");
                } else {
                    throw new Error("Failed to connect to the server");
                }
            } catch (e) {
                console.error(e);
                setIsLoading('Disconnected');
                toast.error("Failed to connect to the server");
                roomRef.current.disconnect();
            }
        })();
    }, [isLoading, roomRef, meetingId, username, setIsLoading]);

    return {
        room: roomRef.current
    };
}