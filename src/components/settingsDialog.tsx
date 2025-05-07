'use client';

import { memo, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Settings, Video, Volume2, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import useMeetingPrefsStore, { Codecs } from "@/store/meetingPrefs";
import { useGetMediaDevices } from "@/hooks/useGetMediaDevices";

const SettingsDialog = memo(({ children }: { children: React.ReactNode }) => {
    const {
        audio: { audioInputDevice, audioOutputDevice },
        video: { videoInputDevice, videoResolution, videoCodec, videoFrames, backgroundBlur },
        setAudioPrefs,
        setVideoPrefs,
    } = useMeetingPrefsStore()

    // Device settings
    const { audioDevices, videoDevices, speakerDevices } = useGetMediaDevices();

    const [resolutions, setResulution] = useState<{ width: number, height: number }[]>([
        { width: 3840, height: 2160 },
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 },
        { width: 640, height: 480 },
        { width: 320, height: 240 },
    ]);
    const [frameRates, setFrameRates] = useState([60, 30, 15, 10]);
    const [activeTab, setActiveTab] = useState<"audio" | "video" | "general">("video")
    const codecss = useMemo<Codecs[]>(
        () => {
            if (!videoDevices.length) return ["vp8", "h264", "vp9", "av1"];
            const codecs: Set<Codecs> = new Set<Codecs>();
            RTCRtpSender.getCapabilities('video')
                ?.codecs
                .map(codec => {
                    if (videoDevices[0].kind === 'videoinput') {
                        const mimeType = codec.mimeType.split('/')[1].toLowerCase()
                        switch (mimeType) {
                            case 'vp8':
                                codecs.add('vp8')
                                break
                            case 'vp9':
                                codecs.add('vp9')
                                break
                            case 'av1':
                                codecs.add('av1')
                                break
                            case 'h264':
                                codecs.add('h264')
                                break
                            default:
                                break
                        }
                    }
                })
            return Array.from(codecs)
        }, [videoDevices]);


    useEffect(() => {
        if (!navigator.mediaDevices || !videoDevices.length) return;
        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        frameRate: { ideal: 60 },
                        width: { ideal: 3840 },
                        height: { ideal: 2160 },
                    }
                });
                const { width, height, frameRate } = stream.getVideoTracks()[0].getSettings()
                stream.getTracks()[0].stop()
                stream.removeTrack(stream.getVideoTracks()[0])

                // preferred devices and settings
                setResulution(prev => prev.filter(res => res.width <= (width || 3840) && res.height <= (height || 2160)))
                setFrameRates((prev) => prev.filter(fps => fps <= (frameRate || 60)))
                setVideoPrefs({
                    videoResolution: {
                        width: (width || 3840),
                        height: (height || 2160)
                    },
                    videoFrames: frameRate,
                })
            } catch (error) {
                console.error("Error getting devices:", error)
                toast.error("Error getting devices. Please check your permissions.")
            }
        })()

    }, [videoDevices, setAudioPrefs, setVideoPrefs])


    return (
        <Dialog defaultOpen={false}>
            <DialogTrigger asChild={true}>
                {children}
            </DialogTrigger>
            <DialogContent className="w-3xl! p-0 max-w-full! sm:max-w-4/5! h-11/12 rounded-xl [&>button]:hidden flex flex-col overflow-hidden outline-none!">
                <DialogTitle className="flex items-center justify-between py-3 pr-3 pl-4 border-b">
                    <span className="text-xl font-normal ml-3">Settings</span>
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full p-3 cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogClose>
                </DialogTitle>
                <div className="flex flex-1">
                    {/* Left sidebar */}
                    <div className="flex flex-col gap-2 select-none">
                        <Button
                            variant={activeTab === "video" ? "default" : "ghost"}
                            className={"flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"}
                            onClick={() => setActiveTab("video")}
                        >
                            <Video className="h-5 w-5 mr-3" />
                            <span className="hidden md:flex text-base">Video</span>
                        </Button>

                        <Button
                            variant={activeTab === "audio" ? "default" : "ghost"}
                            className={"flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"}
                            onClick={() => setActiveTab("audio")}
                        >
                            <Volume2 className="h-5 w-5 mr-3" />
                            <span className="hidden md:flex text-base">Audio</span>
                        </Button>

                        <Button
                            variant={activeTab === "general" ? "default" : "ghost"}
                            className={"flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"}
                            onClick={() => {
                                setActiveTab("general")
                            }}
                        >
                            <Settings className="h-5 w-5 mr-3" />
                            <span className="hidden md:flex text-base">General</span>
                        </Button>
                    </div>

                    {/* Right content */}
                    <div className="px-6 py-3 w-full h-full">
                        {/* Audio Settings */}
                        {activeTab === "audio" && (
                            <div className="space-y-7 w-full">
                                <Label htmlFor="microphone" className="font-medium mb-2 text-base text-primary">Microphone</Label>
                                <Select
                                    value={audioInputDevice?.deviceId}
                                    onValueChange={(deviceId) => {
                                        setAudioPrefs({ audioInputDevice: audioDevices.find((device) => device.deviceId === deviceId) })
                                    }}
                                    disabled={!audioDevices.length}
                                >
                                    <SelectTrigger id="microphone" className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer">
                                        <SelectValue placeholder="Select microphone" />
                                    </SelectTrigger>
                                    <SelectContent align="start" >
                                        <SelectGroup>
                                            {audioDevices.map((device) => (
                                                <SelectItem
                                                    key={device.deviceId}
                                                    value={device.deviceId}
                                                    className="p-2.5 bg-background cursor-pointer"
                                                >
                                                    {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <div className="flex justify-between items-center mb-2 max-w-11/12">
                                    <h3 className="text-primary font-medium flex">Push to talk</h3>
                                    <Switch
                                        defaultChecked={!!audioDevices.length}
                                        onCheckedChange={() => { }}
                                        disabled={!audioDevices.length}
                                        className="shadow cursor-pointer"
                                    />
                                </div>
                                <p className="text-sm text-[#5f6368]">Press and hold spacebar to unmute your mic</p>

                                <div className="space-y-2">
                                    <Label htmlFor="speaker" className="font-medium mb-2 text-base text-primary">Speaker</Label>
                                    <Select
                                        value={audioOutputDevice?.deviceId}
                                        onValueChange={(deviceId) => {
                                            setAudioPrefs({ audioOutputDevice: speakerDevices.find((device) => device.deviceId === deviceId) })
                                        }}
                                        disabled={!audioDevices.length}
                                    >
                                        <SelectTrigger id="speaker" className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer">
                                            <SelectValue placeholder="Select speaker" />
                                        </SelectTrigger>
                                        <SelectContent align="start" >
                                            <SelectGroup>
                                                {speakerDevices.map((device) => (
                                                    <SelectItem
                                                        key={device.deviceId}
                                                        value={device.deviceId}
                                                        className="p-2.5 bg-background cursor-pointer"
                                                    >
                                                        {device.label || `Speaker ${speakerDevices.indexOf(device) + 1}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        className="mt-2"
                                        disabled={!audioDevices.length}
                                    >
                                        Test
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Video Settings */}
                        {activeTab === "video" && (
                            <div className="space-y-8 w-full flex flex-col h-full">
                                <Label htmlFor="camera" className="font-medium mb-2 text-base text-primary">Camera</Label>
                                <Select
                                    value={videoInputDevice?.deviceId}
                                    onValueChange={(deviceId) => {
                                        setVideoPrefs({ videoInputDevice: videoDevices.find((device) => device.deviceId === deviceId) })
                                    }}
                                    disabled={!videoDevices.length}
                                >
                                    <SelectTrigger id="camera" className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer">
                                        <SelectValue placeholder="Select camera" />
                                    </SelectTrigger>
                                    <SelectContent align="start" >
                                        <SelectGroup>
                                            {videoDevices.map((device) => (
                                                <SelectItem
                                                    key={device.deviceId}
                                                    value={device.deviceId}
                                                    className="p-2.5 bg-background cursor-pointer"
                                                >
                                                    {device.label || `Speaker ${videoDevices.indexOf(device) + 1}`}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <div className="flex justify-between items-center mb-2 max-w-11/12">
                                    <h3 className="text-[#1a73e8] font-medium">Background Blur</h3>
                                    <Switch
                                        id="background-blur"
                                        defaultChecked={!!videoDevices.length}
                                        checked={backgroundBlur}
                                        onCheckedChange={(val) => setVideoPrefs({ backgroundBlur: val })}
                                        disabled={!videoDevices.length}
                                        className="shadow cursor-pointer"
                                    />
                                </div>
                                <p className="text-sm text-[#5f6368]">
                                    Blurs your background to keep the focus on you.
                                </p>

                                <Label htmlFor="send_resolution" className="font-medium mb-2 text-base text-primary">Video Send resolution</Label>
                                <Select
                                    value={videoResolution.height + "p"}
                                    onValueChange={(resolution) => {
                                        setVideoPrefs({ videoResolution: resolutions.find((res) => res.height + "p" === resolution) })
                                    }}
                                    disabled={!videoDevices.length}
                                >
                                    <SelectTrigger id="send_resolution" className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer">
                                        <SelectValue placeholder="Select Video Resolution" />
                                    </SelectTrigger>
                                    <SelectContent align="start" >
                                        <SelectGroup>
                                            {resolutions.map((resolution) => (
                                                <SelectItem
                                                    key={resolution.height}
                                                    value={resolution.height + "p"}
                                                    className="p-2.5 bg-background cursor-pointer"
                                                >
                                                    {resolution.height + 'p'}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <Label htmlFor="codecs" className="font-medium mb-2 text-base text-primary">Video Codec</Label>
                                <Select
                                    value={videoCodec}
                                    onValueChange={(codec) => {
                                        setVideoPrefs({ videoCodec: codecss.find((res) => res.toLocaleLowerCase() === codec) })
                                    }}
                                    disabled={!videoDevices.length}
                                >
                                    <SelectTrigger id="codecs" className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer">
                                        <SelectValue placeholder="Select Video Codec" />
                                    </SelectTrigger>
                                    <SelectContent align="start" >
                                        <SelectGroup>
                                            {codecss?.map((codec) => (
                                                <SelectItem
                                                    key={codec}
                                                    value={codec}
                                                    className="p-2.5 bg-background cursor-pointer"
                                                >
                                                    {codec}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <Label htmlFor="frames" className="font-medium mb-2 text-base text-primary">Video Frames</Label>
                                <Select
                                    value={videoFrames.toString()}
                                    onValueChange={(frames) => {
                                        setVideoPrefs({ videoFrames: frameRates.find((res) => res === parseInt(frames)) })
                                    }}
                                    disabled={!videoDevices.length}
                                >
                                    <SelectTrigger id="frames" className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer">
                                        <SelectValue placeholder="Select Video Frames" />
                                    </SelectTrigger>
                                    <SelectContent align="start" >
                                        <SelectGroup>
                                            {frameRates.map((frames) => (
                                                <SelectItem
                                                    key={frames}
                                                    value={frames.toString()}
                                                    className="p-2.5 bg-background cursor-pointer"
                                                >
                                                    {frames + ' fps'}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                            </div>
                        )}

                        {/* General Settings */}
                        {activeTab === "general" && (
                            <div className="space-y-6">
                                <h3 className="text-[#1a73e8] font-medium mb-2">General Settings</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="auto-join">Automatically join meetings</Label>
                                        <Switch id="auto-join" />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="mirror-video">Mirror my video</Label>
                                        <Switch id="mirror-video" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="keyboard-shortcuts">Enable keyboard shortcuts</Label>
                                        <Switch
                                            id="keyboard-shortcuts"
                                            disabled
                                            onCheckedChange={() => {
                                                toast.info("This feature is not available yet.", {
                                                    description: "Please check back later :)",
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
});

export default SettingsDialog;
SettingsDialog.displayName = "SettingsDialog"