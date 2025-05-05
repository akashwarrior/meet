'use client';

import { Label } from "./ui/label";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { memo, useEffect, useMemo, useState } from "react";
import { ChevronDown, Settings, Video, Volume2, X } from "lucide-react";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import useMeetingPrefsStore from "@/store/meetingPrefs";
import { toast } from "sonner";


const SettingsDialog = memo(({ showSettings, setShowSettings }: {
    showSettings: boolean,
    setShowSettings: (showSettings: boolean) => void
}) => {
    const {
        audio: { audioInputDevice, audioOutputDevice },
        video: { videoInputDevice, videoResolution, videoCodec, videoFrames, backgroundBlur },
        meeting: { isAudioEnabled, isVideoEnabled },
        setAudioPrefs,
        setVideoPrefs,
    } = useMeetingPrefsStore()


    // Device settings
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
    const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([])
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])

    const codecss = useMemo(() => {
        if (!videoDevices.length) return null
        const codecs = RTCRtpSender.getCapabilities('video')?.codecs
            .map(codec => codec.mimeType.split('/')[1])
            .filter((v, i, a) => (a.indexOf(v) === i) && ['AV1', 'H264', 'VP8', 'VP9'].includes(v))
        return codecs
    }, [videoDevices]);
    const [resolutions, setResulution] = useState([
        { width: 3840, height: 2160 },
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 },
        { width: 640, height: 480 },
        { width: 320, height: 240 },
    ]);
    const [frameRates, setFrameRates] = useState([60, 30, 15, 10]);

    const [activeTab, setActiveTab] = useState<"audio" | "video" | "general">("audio")
    const [expandedSection, setExpandedSection] = useState<boolean>(false)

    useEffect(() => {
        if (isVideoEnabled) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    frameRate: { ideal: 60 },
                    width: { ideal: 3840 },
                    height: { ideal: 2160 },
                }
            }).then((stream) => {
                const videoTrack = stream.getVideoTracks()[0]
                const settings = videoTrack.getSettings()
                setResulution((prev) => prev.filter(res => res.width <= (settings.width || 3840) && res.height <= (settings.height || 2160)))
                setFrameRates((prev) => prev.filter(fps => fps <= (settings.frameRate || 60)))
                stream.getTracks().forEach((track) => track.stop())
            });
        }

    }, [isVideoEnabled, resolutions])


    useEffect(() => {
        // Get audio and video devices
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                const audio = devices.filter((device) => device.kind === "audioinput" && device.deviceId)
                const video = devices.filter((device) => device.kind === "videoinput" && device.deviceId)
                const speakers = devices.filter((device) => device.kind === "audiooutput" && device.deviceId)
                setAudioDevices(audio)
                setVideoDevices(video)
                setSpeakerDevices(speakers)
            })

        navigator.mediaDevices.ondevicechange = () => {
            navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                    const audio = devices.filter((device) => device.kind === "audioinput" && device.deviceId)
                    const video = devices.filter((device) => device.kind === "videoinput" && device.deviceId)
                    const speakers = devices.filter((device) => device.kind === "audiooutput" && device.deviceId)
                    setAudioDevices(audio)
                    setVideoDevices(video)
                    setSpeakerDevices(speakers)
                    setAudioPrefs({ audioOutputDevice: speakers[0] })
                    setAudioPrefs({ audioInputDevice: audio[0] })
                    setVideoPrefs({ videoInputDevice: video[0] })
                })
        }
    }, [isAudioEnabled, isVideoEnabled, setAudioPrefs, setVideoPrefs])


    return (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
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
                            variant={activeTab === "audio" ? "default" : "ghost"}
                            className={"flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"}
                            onClick={() => setActiveTab("audio")}
                        >
                            <Volume2 className="h-5 w-5 mr-3" />
                            <span className="hidden md:flex text-base">Audio</span>
                        </Button>

                        <Button
                            variant={activeTab === "video" ? "default" : "ghost"}
                            className={"flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"}
                            onClick={() => setActiveTab("video")}
                        >
                            <Video className="h-5 w-5 mr-3" />
                            <span className="hidden md:flex text-base">Video</span>
                        </Button>

                        <Button
                            variant={activeTab === "general" ? "default" : "ghost"}
                            className={"flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"}
                            onClick={() => {
                                toast.info("This feature is not available yet.")
                                // setActiveTab("general")
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
                                    <Button variant="outline" className="mt-2">
                                        Test
                                    </Button>
                                </div>

                                <div>
                                    <span
                                        className="flex justify-between items-center w-11/12 text-primary font-medium cursor-pointer select-none"
                                        onClick={() => setExpandedSection(!expandedSection)}
                                    >
                                        <span>Call control</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full p-2">
                                            <ChevronDown className={`h-5 w-5 transition-all duration-200 ${expandedSection && "rotate-180"}`} />
                                        </Button>
                                    </span>

                                    {expandedSection && (
                                        <div className="mt-2 space-y-4 pl-4 select-none w-fit">
                                            <div className="flex items-center">
                                                <input type="checkbox" id="keyboard-shortcuts" className="mr-2" />
                                                <label htmlFor="keyboard-shortcuts" className="cursor-pointer">Enable keyboard shortcuts</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input type="checkbox" id="noise-cancellation" className="mr-2" />
                                                <label htmlFor="noise-cancellation" className="cursor-pointer">Noise cancellation</label>
                                            </div>
                                        </div>
                                    )}
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

                                <Label htmlFor="send_resolution" className="font-medium mb-2 text-base text-primary">Video Send resolution (maximum)</Label>
                                <Select
                                    value={videoResolution.height + "p"}
                                    onValueChange={(resolution) => {
                                        setVideoPrefs({ videoResolution: resolutions?.find((res) => res.height + "p" === resolution) })
                                    }}
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
                                        setVideoPrefs({ videoCodec: codecss?.find((res) => res === codec) })
                                    }}
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
                                        <Label htmlFor="mute-entry">Mute microphone when joining</Label>
                                        <Switch id="mute-entry" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="video-off-entry">Turn off camera when joining</Label>
                                        <Switch id="video-off-entry" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="mirror-video">Mirror my video</Label>
                                        <Switch id="mirror-video" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="keyboard-shortcuts">Enable keyboard shortcuts</Label>
                                        <Switch id="keyboard-shortcuts" defaultChecked />
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