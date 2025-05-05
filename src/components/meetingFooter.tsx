'use client'

import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { Button } from "./ui/button";
import LiveClock from "./liveClock";
import { useRouter } from "next/navigation";
import useSidebarOpenStore from "@/store/sideBar";
import useMeetingPrefsStore from "@/store/meetingPrefs";
import { Maximize, MessageSquare, Mic, MicOff, MoreVertical, Phone, Users, Video, VideoOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import SettingsDialog from "./settingsDialog";
import { toast } from "sonner";
import { WebRTCService } from "@/lib/webrtc-service";

const MeetingFooter = memo(({ service }: { service: WebRTCService }) => {
    const router = useRouter()
    const [showSettings, setShowSettings] = useState(false)
    const {
        video: {
            videoCodec,
            videoFrames,
            backgroundBlur,
            videoInputDevice,
            videoResolution,
        },
        audio: {
            audioInputDevice,
        },
        meeting: {
            isAudioEnabled,
            isVideoEnabled
        },
        setMeetingPrefs } = useMeetingPrefsStore()
    const { sidebarOpen, activeTab, setSidebarOpen, setActiveTab } = useSidebarOpenStore()

    useEffect(() => {
        if (service && isVideoEnabled) {
            service.sendVideoStream({
                backgroundBlur,
                codec: videoCodec,
                frames: videoFrames,
                resolution: videoResolution,
                deviceId: videoInputDevice?.deviceId,
            })
        } else {
            service.stopVideoStream()
        }
    }, [isVideoEnabled, videoCodec, videoFrames, videoInputDevice, videoResolution])


    useEffect(() => {
        if (service && isAudioEnabled) {
            service.sendAudioStream({
                deviceId: audioInputDevice?.deviceId,
            })
        } else {
            service.stopAudioStream()
        }
    }, [isAudioEnabled, audioInputDevice])

    // Toggle sidebar
    const toggleSidebar = (tab: string) => {
        if (sidebarOpen && activeTab === tab) {
            setSidebarOpen(false)
        } else {
            setSidebarOpen(true)
            setActiveTab(tab)
        }
    }

    // Leave the meeting
    const leaveCall = () => {
        router.push("/")
    }

    return (
        <footer className="bg-background border-t border-border py-3 px-4 md:py-4 md:px-6">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground hidden md:block">
                    <LiveClock />
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 mx-auto md:mx-0">
                    <Button
                        size="icon"
                        variant={!isAudioEnabled ? "destructive" : "secondary"}
                        onClick={() => setMeetingPrefs({ isAudioEnabled: !isAudioEnabled })}
                        className="rounded-full h-10 w-10 md:h-12 md:w-12"
                    >
                        {!isAudioEnabled ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                        size="icon"
                        variant={!isVideoEnabled ? "destructive" : "secondary"}
                        onClick={() => setMeetingPrefs({ isVideoEnabled: !isVideoEnabled })}
                        className="rounded-full h-10 w-10 md:h-12 md:w-12"
                    >
                        {!isVideoEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12">
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
                            <DropdownMenuItem onClick={() => setShowSettings(true)}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                if (document.fullscreenElement) {
                                    document.exitFullscreen()
                                } else {
                                    document.documentElement.requestFullscreen()
                                }
                            }}>
                                <Maximize className="h-4 w-4 mr-2" />
                                {document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        onClick={() => toggleSidebar("chat")}
                        variant="secondary"
                        size="icon"
                        className={cn(
                            "rounded-full h-10 w-10 md:h-12 md:w-12",
                            activeTab === "chat" && sidebarOpen && "bg-blue-100 dark:bg-blue-900",
                        )}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={() => toggleSidebar("participants")}
                        variant="secondary"
                        size="icon"
                        className={cn(
                            "rounded-full h-10 w-10 md:h-12 md:w-12",
                            activeTab === "participants" && sidebarOpen && "bg-blue-100 dark:bg-blue-900",
                        )}
                    >
                        <Users className="h-5 w-5" />
                    </Button>

                    <Button onClick={leaveCall} variant="destructive" className="rounded-full h-10 px-4 md:h-12 md:px-6">
                        <Phone className="h-5 w-5 md:mr-2" />
                        <span className="hidden md:inline">Leave</span>
                    </Button>
                </div>
                <div className="w-24 hidden md:block"></div> {/* Spacer for centering */}
            </div>
            {/* Settings Dialog */}
            <SettingsDialog
                showSettings={showSettings}
                setShowSettings={setShowSettings}
            />
        </footer >
    )
})

MeetingFooter.displayName = "MeetingFooter"
export default MeetingFooter