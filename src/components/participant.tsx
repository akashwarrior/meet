import { memo } from "react";
import { MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Participant as ParticipantType } from "@/lib/webrtc-service";

export const Participant = memo(({
    participant,
    render
}: {
    participant: ParticipantType;
    render: MediaStreamTrack | null;
}) => {

    return (
        <div
            key={participant.id}
            // TODO: ADD BLUE BORDER WHEN AUDIO IS CURRENTLY PLAYING border-2 border-primary
            className={`relative rounded-lg overflow-hidden bg-muted border`}
        >
            {participant.video ? (
                <div className="h-full w-full bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-center">
                    <video
                        autoPlay
                        playsInline
                        muted
                        controls
                        ref={(video) => {
                            if (video && participant.video) {
                                const stream = new MediaStream();
                                stream.addTrack(participant.video!);
                                participant.id !== -1 && participant.audio && stream.addTrack(participant.audio!);
                                video.srcObject = stream;
                            }
                        }}
                        className="h-full w-full object-cover"
                    />
                    <Avatar className="absolute top-2 left-2 right-2 h-10 w-10 bg-white/90">
                        <AvatarImage src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${participant.name!}`} />
                        <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                    <Avatar className="h-20 w-20 bg-white/90">
                        <AvatarImage src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${participant.name!}`} />
                        <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs flex items-center gap-1">
                    {!participant.audio && <MicOff className="h-3 w-3" />}
                    <span>{participant.name!}</span>
                    {/* {participant.isHost && <Badge className="ml-1 text-[10px] py-0">Host</Badge>} */}
                </div>
            </div>
        </div>
    )
});