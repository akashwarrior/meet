'use client'

import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Mic, MicOff } from "lucide-react"
import * as motion from "motion/react-m"
import { LazyMotion } from "motion/react"
import { TrackReference, useParticipantTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

const loadFeatures = () => import("@/components/domAnimation").then(res => res.default)

const Participant = memo(({ identity, userName }: { identity: string, userName: string }) => {

    const tracks = useParticipantTracks([Track.Source.Microphone, Track.Source.Camera], identity);
    const audioTrack = tracks.find((val: TrackReference) => val.source === Track.Source.Microphone)?.publication?.track;
    const videoStream = tracks.find((val: TrackReference) => val.source === Track.Source.Camera)?.publication?.track;

    const IsVideoOn = (videoStream ? !videoStream?.isMuted : false)
    const IsAudioOn = (audioTrack ? !audioTrack?.isMuted : false)

    return (
        <LazyMotion features={loadFeatures}>
            <motion.div
                key={identity}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                layout
                className={`${IsVideoOn ? "w-fit h-fit bg-transparent" : "w-full h-full"} bg-background overflow-hidden m-auto max-w-full max-h-full relative`}
            >
                <video
                    autoPlay
                    playsInline
                    muted
                    className={`rounded-md w-full h-full max-w-full max-h-full object-contain -scale-x-100 ${!IsVideoOn && "hidden"} z-10`}
                    ref={(video) => {
                        if (video) {
                            video.srcObject = IsVideoOn ? videoStream?.mediaStream : null
                        }
                    }}
                />

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20">
                    <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs flex items-center gap-2">
                        {IsAudioOn ? <Mic className="w-3" /> : <MicOff className="w-3" />}
                        <span>{userName}</span>
                    </div>
                </div>

                {/* <div className="z-50 w-full h-full absolute top-0 left-0 hover:opacity-100 opacity-0 inset-shadow-black bg-gradient-to-b from-black/20 to-transparent">
                {name !== "You" && <div className="absolute top-2 right-2 overflow-hidden z-20">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary/80"
                            >
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onMute}>
                                {audioTrack ? "Mute" : "Request Unmute"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onRemove}
                                className="text-red-500"
                            >
                                Remove from meeting
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>}
            </div> */}

                {!IsVideoOn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full relative bg-gray-200 dark:bg-black/25 shadow flex justify-center items-center rounded-md overflow-hidden"
                    >
                        <div className="absolute w-full h-full overflow-visible top-0 left-0 z-10 origin-center animate-bg-effect">
                            <div className="absolute bottom-20 left-20 bg-[#3291ff] w-1/4 h-1/4 dark:w-1/6 dark:h-1/6 blur-[150px] rounded-full"></div>
                            <div className="absolute top-20 right-20 bg-[#79ffe1] w-1/4 h-1/4 dark:w-1/6 dark:h-1/6 blur-[150px] rounded-full"></div>
                        </div>
                        <Avatar
                            className="bg-white/50 dark:bg-[rgba(26,_115,_232,_0.15)] shadow z-20 text-gray-600 dark:text-[rgb(26,_115,_232)]"
                            ref={(element) => {
                                if (element) {
                                    const width = element.parentElement?.clientWidth || 1
                                    const height = element.parentElement?.clientHeight || 1
                                    const maxSize = Math.min(Math.max(width, height) / 3.5, height / 2)
                                    element.style.width = `${maxSize}px`
                                    element.style.height = `${maxSize}px`
                                    element.style.fontSize = `${maxSize / 5}px`
                                }
                            }}
                        >
                            <AvatarImage
                                className="w-1/2 m-auto"
                                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${name}`}
                            />
                            <AvatarFallback className="bg-transparent">{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </motion.div>
                )}
            </motion.div>
        </LazyMotion>
    )
});

Participant.displayName = "Participant"
export default Participant