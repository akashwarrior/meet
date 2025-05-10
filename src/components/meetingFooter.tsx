'use client'

import { cn } from "@/lib/utils";
import { memo } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LiveClock from "./liveClock";
import useSidebarOpenStore from "@/store/sideBar";
import { MessageSquare, Mic, MicOff, Phone, Users, Video, VideoOff } from "lucide-react";
import { DisconnectButton, useLocalParticipant, useMediaDeviceSelect } from "@livekit/components-react";
import useMeetingPrefsStore from "@/store/meetingPrefs";

const MeetingFooter = memo(() => {
    const router = useRouter()
    const { sidebarOpen, setSidebarOpen } = useSidebarOpenStore();
    const { isCameraEnabled, isMicrophoneEnabled, localParticipant } = useLocalParticipant();
    const { facingMode, resolution } = useMeetingPrefsStore(state => state.video);
    const { activeDeviceId: videoDeviceId } = useMediaDeviceSelect({
        kind: "videoinput",
        requestPermissions: false,
    });
    const { activeDeviceId: audioDeviceId } = useMediaDeviceSelect({
        kind: "audioinput",
        requestPermissions: false,
    });

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
            await localParticipant.setCameraEnabled(!isCameraEnabled, {
                deviceId: videoDeviceId,
                facingMode: facingMode,
                resolution: resolution
            });
        } catch (err) {
            console.log(err)
            toast.error("Failed to toggle video", {
                description: err instanceof Error ? err.message : "Error toggling video"
            })
        }
    }

    const toggleMic = async () => {
        try {
            await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled, {
                deviceId: audioDeviceId
            });
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
                    variant={!isMicrophoneEnabled ? "destructive" : "secondary"}
                    onClick={toggleMic}
                    className="rounded-full h-12 w-12"
                >
                    {!isMicrophoneEnabled ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                    size="icon"
                    variant={!isCameraEnabled ? "destructive" : "secondary"}
                    onClick={toggleVideo}
                    className="rounded-full h-12 w-12"
                >
                    {!isCameraEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

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

                <DisconnectButton className="flex items-center justify-center rounded-full h-12 px-4 bg-destructive hover:bg-destructive/50! cursor-pointer dark:bg-destructive/60 text-white" onClick={leaveCall}>
                    <Phone className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Leave</span>
                </DisconnectButton>
            </div>
        </footer >
    )
})

MeetingFooter.displayName = "MeetingFooter"
export default MeetingFooter