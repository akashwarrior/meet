"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { LazyMotion } from 'motion/react'
import * as motion from 'motion/react-m'
import { useSession } from "next-auth/react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { ChevronDown, EllipsisVertical, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react"
import useMeetingPrefsStore from "@/store/meetingPrefs"

const loadFeatures = () => import("@/components/domAnimation").then(res => res.default)
const DropdownMenu = dynamic(() => import("@/components/ui/dropdown-menu").then((mod) => mod.DropdownMenu), { ssr: false })
const DropdownMenuContent = dynamic(() => import("@/components/ui/dropdown-menu").then((mod) => mod.DropdownMenuContent), { ssr: false })
const DropdownMenuItem = dynamic(() => import("@/components/ui/dropdown-menu").then((mod) => mod.DropdownMenuItem), { ssr: false })
const DropdownMenuTrigger = dynamic(() => import("@/components/ui/dropdown-menu").then((mod) => mod.DropdownMenuTrigger), { ssr: false })

export default function PreMeeting({
    isLoading,
    setIsLoading,
    setName,
}: {
    isLoading: boolean,
    setIsLoading: (isLoading: boolean) => void,
    setName: (name: string) => void,
}) {
    const { data: session } = useSession()
    const nameRef = useRef<HTMLInputElement>(null)

    const audioInputDevicesRef = useRef<MediaDeviceInfo[]>([])
    const audioOutputDevicesRef = useRef<MediaDeviceInfo[]>([])
    const videoInputDevicesRef = useRef<MediaDeviceInfo[]>([])
    const [stream, setStream] = useState<MediaStream | null>(null)


    const {
        audio: { audioInputDevice, audioOutputDevice },
        video: { videoInputDevice, videoFrames, videoResolution },
        meeting: { isAudioEnabled, isVideoEnabled },
        setMeetingPrefs,
        setAudioPrefs,
        setVideoPrefs
    } = useMeetingPrefsStore.getState();

    const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState(false)

    const getMediaStream = useCallback(async ({ audio = false, video = false }: { audio?: boolean, video?: boolean }) => {
        try {
            const videoConfig: MediaTrackConstraints = {
                facingMode: "user",
                width: { ideal: videoResolution.width },
                height: { ideal: videoResolution.height },
                frameRate: { ideal: videoFrames, max: 60 },
                autoGainControl: false,
                deviceId: videoInputDevice ? { exact: videoInputDevice.deviceId } : undefined
            }

            const audioConfig: MediaTrackConstraints = {
                deviceId: audioInputDevice ? { exact: audioInputDevice.deviceId } : undefined,
            }

            const constraints: MediaStreamConstraints = {
                audio: audio ? audioConfig : false,
                video: video ? videoConfig : false,
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(stream)
        } catch (error) {
            console.error("Error getting media stream:", error)
            toast.error("Media Error", {
                description: "Could not access selected devices. Please try different ones.",
            })
            throw error
        }
    }, [audioInputDevice, videoInputDevice, videoFrames, videoResolution]);


    useEffect(() => {
        // get all available devices
        const initializeDevices = ({ audio, video }: { audio: boolean, video: boolean }) => {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                devices.forEach((device) => {
                    if (!device.deviceId) return;
                    switch (device.kind) {
                        case "audioinput":
                            if (audio) {
                                audioInputDevicesRef.current.push(device);
                            }
                            break;
                        case "audiooutput":
                            if (audio) {
                                audioOutputDevicesRef.current.push(device);
                            }
                            break;
                        case "videoinput":
                            if (video) {
                                videoInputDevicesRef.current.push(device);
                            }
                            break;
                    }
                });

                if (audioInputDevicesRef.current.length || audioOutputDevicesRef.current.length) {
                    setAudioPrefs({ audioInputDevice: audioInputDevicesRef.current[0], audioOutputDevice: audioOutputDevicesRef.current[0] })
                }
                if (videoInputDevicesRef.current.length) {
                    setVideoPrefs({ videoInputDevice: videoInputDevicesRef.current[0] })
                }
            }).catch((err) => {
                if (err instanceof Error && err.name === 'NotAllowedError') {
                    toast.error("Permission Denied", {
                        description: "Please allow access to your camera and microphone.",
                    });
                } else {
                    toast.error("Error", {
                        description: "Could not access your camera and microphone.",
                    });
                }
            })
        }

        // Check for permissions and initialize devices
        (async () => {
            navigator.permissions.query({ name: "camera" }).then((result) => {
                if (result.state === "granted" && videoInputDevicesRef.current.length == 0) {
                    initializeDevices({ audio: false, video: true })
                } else if (result.state === "prompt") {
                    setShowPermissionDialog(true)
                }
                result.onchange = () => {
                    if (result.state === "granted") {
                        initializeDevices({ audio: false, video: true })
                        setShowPermissionDialog(false)
                    }
                }
            })

            navigator.permissions.query({ name: "microphone" }).then((result) => {
                if (result.state === "granted" && audioInputDevicesRef.current.length == 0) {
                    initializeDevices({ audio: true, video: false })
                } else if (result.state === "prompt") {
                    setShowPermissionDialog(true)
                }
                result.onchange = () => {
                    if (result.state === "granted") {
                        initializeDevices({ audio: true, video: false })
                        setShowPermissionDialog(false)
                    }
                }
            })
        })()

        if (isVideoEnabled) {
            getMediaStream({ video: true }).catch(() => {
                setMeetingPrefs({ isVideoEnabled: false })
            });
        }
        if (isAudioEnabled) {
            getMediaStream({ audio: true }).catch(() => {
                setMeetingPrefs({ isAudioEnabled: false })
            });
        }

        return () => {
            stream?.getTracks().forEach((track) => {
                track.stop()
                stream?.removeTrack(track)
            })
            setStream(null)
        }
    }, []);

    // Toggle camera
    const toggleCamera = () => {
        if (!isVideoEnabled) {
            getMediaStream({ audio: isAudioEnabled, video: true }).then(() => {
                setMeetingPrefs({ isVideoEnabled: true })
            });
        } else {
            stream?.getVideoTracks().forEach((track) => {
                track.stop()
                stream?.removeTrack(track)
            });
            setMeetingPrefs({ isVideoEnabled: false })
        }
    }

    // Toggle microphone
    const toggleMic = () => {
        if (!isAudioEnabled) {
            getMediaStream({ audio: true, video: isVideoEnabled }).then(() => {
                setMeetingPrefs({ isAudioEnabled: true })
            });
        } else {
            stream?.getAudioTracks().forEach((track) => {
                track.stop()
                stream?.removeTrack(track)
            });
            setMeetingPrefs({ isAudioEnabled: false })
        }
    }

    // Join the meeting
    const joinMeeting = () => {
        if (!nameRef.current?.value.trim()) {
            toast.error("Name Required", {
                description: "Please enter your name to join the meeting",
            })
            return
        }
        setIsLoading(false)
    }

    return (
        <LazyMotion features={loadFeatures}>
            <div className="min-h-[90vh] bg-background flex flex-col items-center justify-center">
                <Header />
                <main className="flex flex-col lg:flex-row gap-20 md:gap-5 items-center justify-around m-auto w-11/12">
                    <div className="w-full flex flex-col items-center lg:items-start relative lg:max-w-8/12">
                        <div className="relative w-full h-full rounded-xl overflow-hidden sm:max-w-11/12 aspect-video">
                            {(isVideoEnabled && stream?.getVideoTracks().length) ? (
                                <video
                                    autoPlay
                                    playsInline
                                    muted
                                    ref={(video) => {
                                        if (video) {
                                            video.srcObject = stream
                                        }
                                    }}
                                    className="w-full h-full max-w-full max-h-full -scale-x-100 object-cover"
                                />

                            ) : (
                                <div className="w-full h-full bg-gray-950/90 flex">
                                    <div className="text-white text-2xl m-auto">
                                        Camera is off
                                    </div>
                                </div>
                            )}

                            <div className="absolute bottom-0 flex gap-6 left-0 right-0 items-center justify-center inset-shadow-black bg-gradient-to-t from-black/60 to-transparent py-4">
                                <Button
                                    size="icon"
                                    className={`rounded-full p-6 md:p-6.5 flex border-none ring-1 ${(isAudioEnabled && stream?.getAudioTracks().length) ? "bg-transparent hover:bg-white/40" : "hover:bg-red-700 bg-red-500 ring-transparent"}`}
                                    onClick={toggleMic}
                                >
                                    {(isAudioEnabled && stream?.getAudioTracks().length) ? <Mic className="md:w-5! md:h-5!" /> : <MicOff className="md:w-5! md:h-5!" />}
                                </Button>

                                <Button
                                    size="icon"
                                    className={`rounded-full p-6 md:p-6.5 flex border-none ring-1 ${(isVideoEnabled && stream?.getVideoTracks().length) ? "bg-transparent hover:bg-white/40" : "hover:bg-red-700 bg-red-500 ring-transparent"}`}
                                    onClick={toggleCamera}
                                >
                                    {(isVideoEnabled && stream?.getVideoTracks().length) ? <Video className="md:w-5! md:h-5!" /> : <VideoOff className="md:w-5! md:h-5!" />}
                                </Button>
                            </div>

                            <div className="absolute top-0 left-0 right-0 flex bg-gradient-to-b from-black/50 to-transparent p-3 justify-end items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full text-white hover:bg-primary/50"
                                >
                                    <EllipsisVertical className="w-5! h-5!" />
                                </Button>
                            </div>
                        </div>

                        {/* Device selection */}
                        <div className="my-4 gap-4 hidden lg:flex items-center justify-start w-full">
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="rounded-full flex items-center gap-3 px-4! focus-visible:ring-0 flex-1 max-w-1/4 border-0 hover:border hover:bg-primary/10! duration-200 shadow-none"
                                        disabled={!audioInputDevicesRef.current.length}
                                    >
                                        <Mic />
                                        <motion.span
                                            className="truncate"
                                            key={audioInputDevice?.label}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {audioInputDevice?.label || "Permission needed"}
                                        </motion.span>
                                        <ChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="start"
                                    className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0 "
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="w-full h-full bg-background overflow-hidden"
                                    >{audioInputDevicesRef.current.map((device) =>
                                        <DropdownMenuItem
                                            key={device.deviceId}
                                            onClick={() => setAudioPrefs({ audioInputDevice: device })}
                                            className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === audioInputDevice?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                                        >
                                            {device.label}
                                        </DropdownMenuItem>)}
                                    </motion.div>

                                </DropdownMenuContent>
                            </DropdownMenu>


                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="rounded-full flex items-center gap-3 px-4! focus-visible:ring-0 flex-1 max-w-1/4 border-0 hover:border hover:bg-primary/10! duration-200 shadow-none"
                                        disabled={!audioOutputDevicesRef.current.length}
                                    >
                                        <Volume2 />
                                        <motion.span
                                            className="truncate"
                                            key={audioOutputDevice?.label}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {audioOutputDevice?.label || "Permission needed"}
                                        </motion.span>
                                        <ChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="start"
                                    className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0 "
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="w-full h-full bg-background overflow-hidden"
                                    >{audioOutputDevicesRef.current.map((device) =>
                                        <DropdownMenuItem
                                            key={device.deviceId}
                                            onClick={() => setAudioPrefs({ audioOutputDevice: device })}
                                            className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === audioOutputDevice?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                                        >
                                            {device.label}
                                        </DropdownMenuItem>)}
                                    </motion.div>

                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu modal={false} >
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="rounded-full flex items-center gap-3 px-4! focus-visible:ring-0 flex-1 max-w-1/4 border-0 hover:border hover:bg-primary/10! duration-200 shadow-none"
                                        disabled={!videoInputDevicesRef.current.length}
                                    >
                                        <Video />
                                        <motion.span
                                            className="truncate"
                                            key={videoInputDevice?.label}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {videoInputDevice?.label || "Permission needed"}
                                        </motion.span>
                                        <ChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="start"
                                    className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0 "
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="w-full h-full bg-background overflow-hidden"
                                    >{videoInputDevicesRef.current.map((device) =>
                                        <DropdownMenuItem
                                            key={device.deviceId}
                                            onClick={() => setVideoPrefs({ videoInputDevice: device })}
                                            className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === videoInputDevice?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                                        >
                                            {device.label}
                                        </DropdownMenuItem>)}
                                    </motion.div>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="w-full max-w-xs flex flex-col gap-7 items-center">
                        <h1 className="text-2xl text-foreground">What&apos;s your name?</h1>
                        <Input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            onChange={(e) => setName(e.target.value)}
                            ref={nameRef}
                            defaultValue={session?.user?.name || ""}
                            disabled={!isLoading}
                            className="border rounded-md h-full bg-background focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 p-4.5 md:text-base"
                        />

                        <Button
                            variant="default"
                            className="text-base font-bold rounded-full px-16 py-7 mt-2"
                            onClick={joinMeeting}
                            disabled={!isLoading}
                        >
                            {!isLoading ? "Joining..." : "Join Meeting"}
                        </Button>
                    </div>
                </main>

                {/* Permission Dialog */}
                <Dialog open={showPermissionDialog}>
                    <DialogContent className="[&>button]:hidden border-none flex flex-col items-center rounded-2xl md:max-w-3xl!" aria-describedby={undefined}>
                        <DialogTitle />
                        <Image
                            width={200}
                            height={200}
                            loading="lazy"
                            src="/dialog_image.jpeg"
                            alt="Permission illustration"
                            className="w-1/2 rounded-lg max-w-2xs"
                        />
                        <h2 className="text-2xl font-normal text-center">
                            Do you want people to see and hear you in the meeting?
                        </h2>

                        <p className="text-center text-muted-foreground">
                            You can still turn off your microphone and camera anytime in the meeting.
                        </p>
                        <div className="flex w-full items-center justify-center gap-3 max-w-lg">
                            <Button
                                className="text-white py-5.5 rounded-full min-w-4/5 px-6"
                                onClick={() => {
                                    getMediaStream({ audio: true, video: true }).then(() => {
                                        setMeetingPrefs({ isAudioEnabled: true, isVideoEnabled: true })
                                    }).catch(() => {
                                        setMeetingPrefs({ isAudioEnabled: false, isVideoEnabled: false });
                                    });
                                }}
                            >
                                Use microphone and camera
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className={`text-primary rounded-full p-5 ${isCollapsed ? "rotate-180" : ""}`}
                                onClick={() => setIsCollapsed(!isCollapsed)}
                            >
                                <ChevronDown />
                            </Button>
                        </div>

                        <motion.div
                            initial={{ height: 0 }}
                            animate={isCollapsed ? { height: "auto" } : { height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-11/12 overflow-hidden flex flex-col gap-4 items-center max-w-md">
                            <div className="flex gap-3 md:gap-4 w-full">
                                <Button
                                    variant="outline"
                                    className="rounded-full flex-1 py-5 px-6.5 text-primary hover:text-primary hover:bg-primary/10!"
                                    onClick={() => {
                                        getMediaStream({ audio: true }).then(() => {
                                            setMeetingPrefs({ isAudioEnabled: true })
                                        }).catch(() => {
                                            setMeetingPrefs({ isAudioEnabled: false })
                                        });
                                    }}
                                >
                                    Use microphone
                                </Button>

                                <Button
                                    variant="outline"
                                    className="rounded-full flex-1 py-5 px-6.5 text-primary hover:text-primary hover:bg-primary/10!"
                                    onClick={() => {
                                        getMediaStream({ video: true }).then(() => {
                                            setMeetingPrefs({ isVideoEnabled: true })
                                        }).catch(() => {
                                            setMeetingPrefs({ isVideoEnabled: false })
                                        });
                                    }}
                                >
                                    Use camera
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                className="p-5 rounded-full"
                                onClick={() => setShowPermissionDialog(false)}
                            >
                                Continue without microphone and camera
                            </Button>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            </div >
        </LazyMotion>
    )
}