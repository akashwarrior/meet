"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { EllipsisVertical, Mic, MicOff, Video, VideoOff } from "lucide-react"
import useMeetingPrefsStore from "@/store/meetingPrefs"
import { useRoomContext } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import Header from "@/components/header"
import dynamic from "next/dynamic"

const SettingsDialog = dynamic(() => import("./settingsDialog").then((mod) => mod.default), { ssr: false })
const PermissionDialog = dynamic(() => import("./permissionDialog").then((mod) => mod.default), { ssr: false })
const DeviceSelection = dynamic(() => import("./deviceSelection").then((mod) => mod.default), { ssr: false })

export default function PreMeeting({ meetingId }: { meetingId: string }) {
    const { connect, state } = useRoomContext();
    const { data: session } = useSession()
    const nameRef = useRef<HTMLInputElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const isVideoEnabled = useMeetingPrefsStore(state => state.meeting.isVideoEnabled);

    useEffect(() => {
        if (isVideoEnabled) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    streamRef.current = stream
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                    }
                }).catch((error) => {
                    console.error("Error getting media stream:", error)
                    toast.error("Media Error", {
                        description: "Could not access selected devices. Please try different ones.",
                    })
                })
        }

        return () => {
            streamRef.current?.getTracks().forEach((track) => {
                track.stop()
                streamRef.current?.removeTrack(track)
            })
        }
    }, [isVideoEnabled])


    // Join the meeting
    const joinMeeting = async () => {
        const username = nameRef.current?.value.trim()
        if (!username) {
            toast.error("Name Required", {
                description: "Please enter your name to join the meeting",
            })
            return
        }
        try {
            const res = await fetch(`/api/token?meetingId=${meetingId}&username=${username}`);
            const data = await res.json();
            if (data.token) {
                await connect(process.env.NEXT_PUBLIC_LIVEKIT_URL as string, data.token);
            } else {
                throw new Error("Failed to connect to the server");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to connect to the server");
        }
    }


    return (
        <div className="min-h-[90vh] bg-background flex flex-col items-center justify-center">
            <Header />
            <main className="flex flex-col lg:flex-row gap-20 md:gap-5 items-center justify-around m-auto w-11/12">
                <div className="w-full flex flex-col items-center lg:items-start relative lg:max-w-8/12">
                    <div className="relative w-full h-full rounded-xl overflow-hidden sm:max-w-11/12 aspect-video">
                        {isVideoEnabled ? (
                            <video
                                autoPlay
                                playsInline
                                muted
                                ref={videoRef}
                                className="w-full h-full max-w-full max-h-full -scale-x-100 object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-950/90 flex">
                                <div className="text-white text-2xl m-auto">
                                    Camera is off
                                </div>
                            </div>
                        )}
                        <VideoControls />
                    </div>
                    <DeviceSelection />
                </div>

                <div className="w-full max-w-xs flex flex-col gap-7 items-center">
                    <h1 className="text-2xl text-foreground">What&apos;s your name?</h1>
                    <Input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        ref={nameRef}
                        defaultValue={session?.user?.name || ""}
                        disabled={state === ConnectionState.Connecting}
                        className="border rounded-md h-full bg-background focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 p-4.5 md:text-base"
                    />

                    <Button
                        variant="default"
                        className="text-base font-bold rounded-full px-16 py-7 mt-2"
                        onClick={joinMeeting}
                        disabled={state === ConnectionState.Connecting}
                    >
                        {state === ConnectionState.Connecting ? "Joining..." : "Join Meeting"}
                    </Button>
                </div>
            </main>

            {/* Permission Dialog */}
            <PermissionDialog />
        </div >
    )
}


const VideoControls = () => {
    const isAudioEnabled = useMeetingPrefsStore(state => state.meeting.isAudioEnabled);
    const isVideoEnabled = useMeetingPrefsStore(state => state.meeting.isVideoEnabled);
    const setMeetingPrefs = useMeetingPrefsStore(state => state.setMeetingPrefs);
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        if (isAudioEnabled) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    streamRef.current = stream
                })
                .catch((error) => {
                    console.error("Error getting media stream:", error)
                    toast.error("Media Error", {
                        description: "Could not access selected devices. Please try different ones.",
                    })
                });
        }
        return () => {
            streamRef.current?.getTracks().forEach((track) => {
                track.stop()
                streamRef.current?.removeTrack(track)
            })
        }
    }, [isAudioEnabled])

    return (
        <>
            <div className="absolute bottom-0 flex gap-6 left-0 right-0 items-center justify-center inset-shadow-black bg-gradient-to-t from-black/60 to-transparent py-4">
                <Button
                    size="icon"
                    className={`rounded-full p-6 md:p-6.5 flex border-none ring-1 ${isAudioEnabled ? "bg-transparent hover:bg-white/40" : "hover:bg-red-700 bg-red-500 ring-transparent"}`}
                    onClick={() => setMeetingPrefs({ isAudioEnabled: !isAudioEnabled })}
                >
                    {isAudioEnabled ? <Mic className="md:w-5! md:h-5!" /> : <MicOff className="md:w-5! md:h-5!" />}
                </Button>

                <Button
                    size="icon"
                    className={`rounded-full p-6 md:p-6.5 flex border-none ring-1 ${isVideoEnabled ? "bg-transparent hover:bg-white/40" : "hover:bg-red-700 bg-red-500 ring-transparent"}`}
                    onClick={() => setMeetingPrefs({ isVideoEnabled: !isVideoEnabled })}
                >
                    {isVideoEnabled ? <Video className="md:w-5! md:h-5!" /> : <VideoOff className="md:w-5! md:h-5!" />}
                </Button>
            </div>

            <div className="absolute top-0 left-0 right-0 flex bg-gradient-to-b from-black/50 to-transparent p-3 justify-end items-center">
                <SettingsDialog>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-white hover:bg-primary/50"
                    >
                        <EllipsisVertical className="w-5! h-5!" />
                    </Button>
                </SettingsDialog>
            </div>
        </>
    )
}