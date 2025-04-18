import { Participant } from "@/components/participant"
import { CallSidebar } from "@/components/callSidebar"
import { WebRTCService } from "@/lib/webrtc-service"
import { Participant as ParticipantType } from "@/lib/webrtc-service"
import { useEffect, useState } from "react"

const useWebRTCService = () => {
    const [webRTCService, setWebRTCService] = useState<WebRTCService | null>(null)

    useEffect(() => {
        WebRTCService.getInstance("roomId")
            .then((service) => {
                setWebRTCService(service)
            })
            .catch((error) => {
                console.error("Error initializing WebRTC service:", error)
            })

        return () => {
            webRTCService?.leave()
            setWebRTCService(null)
        }
    }, [])

    return webRTCService;
}

export function Meeting({ isVideoOn }: { isVideoOn: boolean }) {
    const webRTCService = useWebRTCService();
    const [participants, setParticipants] = useState<ParticipantType[]>([]);

    useEffect(() => {
        if (!webRTCService) return;
        webRTCService.getMediaStreams((id, track) => {
            setParticipants(prev => (prev.map(participant => {
                if (participant.id === id) {
                    switch (track?.kind) {
                        case "video":
                            participant.video = track;
                            break;
                        case "audio":
                            participant.audio = track;
                            break;
                        default:
                            participant.video = null;
                            participant.audio = null;
                            break;
                    }
                }
                return participant;
            })
            ));
        });

        webRTCService.getParticipants((participants) => {
            setParticipants(prev => prev ? [...prev, participants] : [participants]);
        });

        webRTCService.onParticipantLeave((id) => {
            setParticipants(prev => {
                const participant = prev.find(participant => participant.id === id);
                if (participant) {
                    participant.video?.stop();
                    participant.audio?.stop();
                }
                return prev.filter(participant => participant.id !== id)
            });
        });

        return () => {
            webRTCService.leave();
            setParticipants([]);
        };
    }, [webRTCService]);

    useEffect(() => {
        isVideoOn ? webRTCService?.sendMediaStream() : webRTCService?.stopMediaStream();
    }, [isVideoOn, webRTCService]);

    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Main meeting area */}
            <div className="relative flex-1 bg-secondary/10 overflow-hidden">
                {!webRTCService ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-white">
                            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                            <p>Connecting to meeting...</p>
                            <p className="mt-2 text-sm text-muted-foreground">This may take a few moments</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 h-full">
                        {participants.map(
                            (participant) =>
                                <Participant
                                    key={participant.id}
                                    participant={participant}
                                    render={participant.video || participant.audio}
                                />
                        )}
                    </div>
                )}
            </div>

            {/* Side panel */}
            <CallSidebar participants={participants} />
        </div>
    )
}