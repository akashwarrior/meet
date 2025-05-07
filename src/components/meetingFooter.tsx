'use client'

import { cn } from "@/lib/utils";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Maximize, MessageSquare, Mic, MicOff, Minimize, MoreVertical, Phone, Users, Video, VideoOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import SettingsDialog from "./settingsDialog";
import LiveClock from "./liveClock";
import useSidebarOpenStore from "@/store/sideBar";
import useMeetingPrefsStore from "@/store/meetingPrefs";
import { LocalParticipant, LocalTrackPublication } from 'livekit-client'

const MeetingFooter = memo(({ localParticipant }: { localParticipant: LocalParticipant }) => {
    const router = useRouter()
    const {
        video: { videoCodec, videoFrames, videoResolution, videoInputDevice },
        audio: { audioInputDevice },
        meeting: { isAudioEnabled, isVideoEnabled },
        setMeetingPrefs
    } = useMeetingPrefsStore()
    const { sidebarOpen, setSidebarOpen } = useSidebarOpenStore()
    const [fullScreenEnabled, setFullScreenEnabled] = useState(false)
    const publisherRef = useRef<LocalTrackPublication>(undefined)

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (document.fullscreenElement) {
                setFullScreenEnabled(true)
            } else {
                setFullScreenEnabled(false)
            }
        }
        window.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            window.removeEventListener("fullscreenchange", handleFullscreenChange);
        }
    }, [])

    useEffect(() => {
        if (isVideoEnabled && publisherRef.current?.videoTrack) {
            console.log("setting codec", videoCodec)
            publisherRef.current.videoTrack.codec = videoCodec
            publisherRef.current.videoTrack.restartTrack()
        }
    }, [videoFrames, videoCodec, videoInputDevice, videoResolution])

    // Toggle sidebar
    const toggleSidebar = (tab: "participants" | "chat" | null) => {
        if (sidebarOpen === tab) {
            setSidebarOpen(null)
        } else {
            setSidebarOpen(tab)
        }
    }

    const toggleVideo = async () => {
        try {
            publisherRef.current = await localParticipant.setCameraEnabled(!isVideoEnabled, {
                facingMode: 'user',
                deviceId: { exact: videoInputDevice?.deviceId },
                resolution: {
                    width: videoResolution.width,
                    height: videoResolution.height,
                    frameRate: videoFrames
                },
            }, {
                videoCodec,
                simulcast: false,
                backupCodec: {
                    codec: 'vp8',
                },
            });
            setMeetingPrefs({ isVideoEnabled: !isVideoEnabled })
        } catch (err) {
            toast.error("Failed to toggle video", {
                description: err instanceof Error ? err.message : "Error toggling video"
            })
        }
    }

    const toggleMic = async () => {
        try {
            await localParticipant.setMicrophoneEnabled(!isAudioEnabled, {
                deviceId: { exact: audioInputDevice?.deviceId }
            });
            setMeetingPrefs({ isAudioEnabled: !isAudioEnabled })
        } catch (err) {
            toast.error("Failed to toggle audio", {
                description: err instanceof Error ? err.message : "Error toggling audio"
            })
        }
    }

    // Leave the meeting
    const leaveCall = () => {
        router.push("/")
    }

    return (
        <footer className="bg-background border-t border-border py-4 flex relative">
            <div className="text-sm text-muted-foreground absolute left-10 top-0 bottom-0 hidden sm:flex">
                <LiveClock />
            </div>
            <div className="flex items-center gap-2 mx-auto">
                <Button
                    size="icon"
                    variant={!isAudioEnabled ? "destructive" : "secondary"}
                    onClick={toggleMic}
                    className="rounded-full h-12 w-12"
                >
                    {!isAudioEnabled ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                    size="icon"
                    variant={!isVideoEnabled ? "destructive" : "secondary"}
                    onClick={toggleVideo}
                    className="rounded-full h-12 w-12"
                >
                    {!isVideoEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>


                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                            toast.info("This feature is not yet implemented", {
                                description: "Recording is not yet implemented. Please check back later.",
                            })
                        }}>
                            {/* {isRecording ? "Stop recording" : "Start recording"} */}
                            Start recording
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                            e.preventDefault()
                        }}>
                            <SettingsDialog>
                                <span>
                                    Settings
                                </span>
                            </SettingsDialog>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            if (document.fullscreenElement) {
                                document.exitFullscreen()
                            } else {
                                document.documentElement.requestFullscreen()
                            }
                        }}>
                            {fullScreenEnabled ? <Minimize /> : <Maximize className="h-4 w-4 mr-2" />}
                            {fullScreenEnabled ? "Exit" : "Enter"} Fullscreen
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    onClick={() => toggleSidebar("chat")}
                    variant="secondary"
                    size="icon"
                    className={cn(
                        "rounded-full h-12 w-12",
                        sidebarOpen === "chat" && "bg-primary/90 hover:bg-primary/50",
                    )}
                >
                    <MessageSquare className="h-5 w-5" />
                </Button>

                <Button
                    onClick={() => toggleSidebar("participants")}
                    variant="secondary"
                    size="icon"
                    className={cn(
                        "rounded-full h-12 w-12",
                        sidebarOpen === "participants" && "bg-primary/90 hover:bg-primary/50",
                    )}
                >
                    <Users className="h-5 w-5" />
                </Button>

                <Button onClick={leaveCall} variant="destructive" className="rounded-full h-12 px-4!">
                    <Phone className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Leave</span>
                </Button>
            </div>
        </footer >
    )
})

MeetingFooter.displayName = "MeetingFooter"
export default MeetingFooter