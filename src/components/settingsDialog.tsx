"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Settings, Video, Volume2, X } from "lucide-react";
import { useMediaDeviceSelect } from "@livekit/components-react";
import { VideoPreset, VideoPresets } from "livekit-client";
import useMeetingPrefsStore, { Codecs } from "@/store/meetingPrefs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function SettingsDialog({ children }: { children: React.ReactNode }) {
  const { resolution, videoCodec, facingMode } = useMeetingPrefsStore(
    (state) => state.video,
  );
  const { setVideoPrefs } = useMeetingPrefsStore();

  const {
    devices: audioDevices,
    activeDeviceId: audioActiveDeviceId,
    setActiveMediaDevice: setAudioActiveDevice,
  } = useMediaDeviceSelect({
    kind: "audioinput",
    requestPermissions: false,
  });
  const {
    devices: videoDevices,
    activeDeviceId: videoActiveDeviceId,
    setActiveMediaDevice: setVideoActiveDevice,
  } = useMediaDeviceSelect({
    kind: "videoinput",
    requestPermissions: false,
  });
  const {
    devices: speakerDevices,
    activeDeviceId: speakerActiveDeviceId,
    setActiveMediaDevice: setSpeakerActiveDevice,
  } = useMediaDeviceSelect({
    kind: "audiooutput",
    requestPermissions: false,
  });

  const [resolutions, setResulution] = useState<VideoPreset[]>([]);
  const [activeTab, setActiveTab] = useState<"audio" | "video" | "general">(
    "video",
  );
  const codecss = ["vp8", "h264", "vp9", "av1"];
  const facingModes = ["user", "environment", "left", "right"];

  useEffect(() => {
    if (
      !navigator.mediaDevices ||
      !videoDevices.length ||
      !videoDevices[0].deviceId
    )
      return;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const { width, height } = stream.getVideoTracks()[0].getCapabilities();
        stream.getTracks()[0].stop();
        stream.removeTrack(stream.getVideoTracks()[0]);
        const resolutions = Object.values(VideoPresets).filter(
          (res) =>
            res.width <= (width?.max || 1920) &&
            res.height <= (height?.max || 1080),
        );
        setResulution(resolutions);
        setVideoPrefs({
          resolution: {
            width: resolutions[resolutions.length - 1].width,
            height: resolutions[resolutions.length - 1].height,
            frameRate:
              resolutions[resolutions.length - 1].encoding.maxFramerate,
          },
        });
      } catch (error) {
        console.error("Error getting devices:", error);
        toast.error("Error getting devices. Please check your permissions.");
      }
    })();
  }, [videoDevices]);

  return (
    <Dialog defaultOpen={false}>
      <DialogTrigger asChild={true}>{children}</DialogTrigger>
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
          <div className="flex flex-col gap-2 select-none">
            <Button
              variant={activeTab === "video" ? "default" : "ghost"}
              className={
                "flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"
              }
              onClick={() => setActiveTab("video")}
            >
              <Video className="h-5 w-5 mr-3" />
              <span className="hidden md:flex text-base">Video</span>
            </Button>

            <Button
              variant={activeTab === "audio" ? "default" : "ghost"}
              className={
                "flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"
              }
              onClick={() => setActiveTab("audio")}
            >
              <Volume2 className="h-5 w-5 mr-3" />
              <span className="hidden md:flex text-base">Audio</span>
            </Button>

            <Button
              variant={activeTab === "general" ? "default" : "ghost"}
              className={
                "flex items-center justify-start py-5.5 md:min-w-48 px-5! sm:px-8! rounded-r-full"
              }
              onClick={() => {
                setActiveTab("general");
              }}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span className="hidden md:flex text-base">General</span>
            </Button>
          </div>

          <div className="px-6 py-3 w-full h-full">
            {activeTab === "video" && (
              <div className="w-full flex flex-col h-full gap-5">
                <div>
                  <Label
                    htmlFor="camera"
                    className="font-medium mb-2 text-base text-primary"
                  >
                    Camera
                  </Label>
                  <Select
                    value={
                      videoDevices?.[0]?.deviceId
                        ? videoDevices.find(
                          (device) => device.deviceId === videoActiveDeviceId,
                        )?.deviceId || videoDevices[0].deviceId
                        : "Permission needed"
                    }
                    onValueChange={(deviceId) => setVideoActiveDevice(deviceId)}
                    disabled={!videoDevices?.[0]?.deviceId}
                  >
                    <SelectTrigger
                      id="camera"
                      className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer"
                    >
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        {videoDevices.map(({ deviceId, label }) => (
                          <SelectItem
                            key={deviceId || videoActiveDeviceId}
                            value={deviceId || videoActiveDeviceId}
                            className="p-2.5 bg-background cursor-pointer"
                          >
                            {label || videoActiveDeviceId}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="send_resolution"
                    className="font-medium mb-2 text-base text-primary"
                  >
                    Video Send resolution
                  </Label>
                  <Select
                    value={resolution?.height.toString()}
                    onValueChange={(resolution) => {
                      const res = resolutions.find(
                        (res) => res.height === parseInt(resolution),
                      );
                      if (!res) return;
                      setVideoPrefs({
                        resolution: {
                          width: res.width,
                          height: res.height,
                          frameRate: res.encoding.maxFramerate,
                        },
                      });
                    }}
                    disabled={!videoDevices?.[0]?.deviceId}
                  >
                    <SelectTrigger
                      id="send_resolution"
                      className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer"
                    >
                      <SelectValue placeholder="Select Video Resolution" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        {resolutions.map(({ height }) => (
                          <SelectItem
                            key={height}
                            value={height.toString()}
                            className="p-2.5 bg-background cursor-pointer"
                          >
                            {height + "p"}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="codecs"
                    className="font-medium mb-2 text-base text-primary"
                  >
                    Video Codec
                  </Label>
                  <Select
                    value={videoCodec}
                    onValueChange={(codec) =>
                      setVideoPrefs({ videoCodec: codec as Codecs })
                    }
                    disabled={!videoDevices?.[0]?.deviceId}
                  >
                    <SelectTrigger
                      id="codecs"
                      className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer"
                    >
                      <SelectValue placeholder="Select Video Codec" />
                    </SelectTrigger>
                    <SelectContent align="start">
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
                </div>

                <div>
                  <Label
                    htmlFor="frames"
                    className="font-medium mb-2 text-base text-primary"
                  >
                    Video Frames
                  </Label>
                  <Select
                    value={resolution?.frameRate?.toString() || "0 fps"}
                    onValueChange={(frames) => {
                      const res = resolutions.find(
                        (res) => res.encoding.maxFramerate === parseInt(frames),
                      );
                      if (!res) return;
                      setVideoPrefs({
                        resolution: {
                          width: res.width,
                          height: res.height,
                          frameRate: res.encoding.maxFramerate,
                        },
                      });
                    }}
                    disabled={!videoDevices?.[0]?.deviceId}
                  >
                    <SelectTrigger
                      id="frames"
                      className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer"
                    >
                      <SelectValue placeholder="Select Video Frames" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        {resolutions.map(
                          ({ height, encoding: { maxFramerate } }) =>
                            height === resolution?.height && (
                              <SelectItem
                                key={maxFramerate}
                                value={maxFramerate?.toString() || "0"}
                                className="p-2.5 bg-background cursor-pointer"
                              >
                                {maxFramerate + " fps"}
                              </SelectItem>
                            ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="facing_mode"
                    className="font-medium mb-2 text-base text-primary"
                  >
                    Facing Mode
                  </Label>
                  <Select
                    value={facingMode}
                    onValueChange={(facingMode) =>
                      setVideoPrefs({
                        facingMode: facingMode as
                          | "user"
                          | "environment"
                          | "left"
                          | "right",
                      })
                    }
                  >
                    <SelectTrigger
                      id="facing_mode"
                      className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer"
                    >
                      <SelectValue placeholder="Select facing mode" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {facingModes.map((facingMode) => (
                        <SelectItem
                          key={facingMode}
                          value={facingMode}
                          className="p-2.5 bg-background cursor-pointer"
                        >
                          {facingMode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {activeTab === "audio" && (
              <div className="space-y-7 w-full">
                <Label
                  htmlFor="microphone"
                  className="font-medium mb-2 text-base text-primary"
                >
                  Microphone
                </Label>
                <Select
                  value={
                    audioDevices?.[0]?.deviceId
                      ? audioDevices.find(
                        (device) => device.deviceId === audioActiveDeviceId,
                      )?.deviceId || audioDevices[0].deviceId
                      : "Permission needed"
                  }
                  onValueChange={(deviceId) => setAudioActiveDevice(deviceId)}
                  disabled={!audioDevices?.[0]?.deviceId}
                >
                  <SelectTrigger
                    id="microphone"
                    className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer"
                  >
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectGroup>
                      {audioDevices.map(({ deviceId, label }) => (
                        <SelectItem
                          key={deviceId || audioActiveDeviceId}
                          value={deviceId || audioActiveDeviceId}
                          className="p-2.5 bg-background cursor-pointer"
                        >
                          {label || audioActiveDeviceId}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="flex justify-between items-center mb-2 max-w-11/12">
                  <h3 className="text-primary font-medium flex">
                    Push to talk
                  </h3>
                  <Switch
                    defaultChecked={!!audioDevices?.[0]?.deviceId}
                    onCheckedChange={() => { }}
                    disabled={!audioDevices?.[0]?.deviceId}
                    className="shadow cursor-pointer"
                  />
                </div>
                <p className="text-sm text-[#5f6368]">
                  Press and hold spacebar to unmute your mic
                </p>

                <div className="space-y-2">
                  <Label
                    htmlFor="speaker"
                    className="font-medium mb-2 text-base text-primary"
                  >
                    Speaker
                  </Label>
                  <Select
                    value={
                      speakerDevices?.[0]?.deviceId
                        ? speakerDevices.find(
                          (device) =>
                            device.deviceId === speakerActiveDeviceId,
                        )?.deviceId || speakerDevices[0].deviceId
                        : "Permission needed"
                    }
                    onValueChange={(deviceId) =>
                      setSpeakerActiveDevice(deviceId)
                    }
                    disabled={!speakerDevices?.[0]?.deviceId}
                  >
                    <SelectTrigger
                      id="speaker"
                      className="max-w-11/12! w-full! truncate py-6 border-primary cursor-pointer"
                    >
                      <SelectValue placeholder="Select speaker" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        {speakerDevices.map(({ deviceId, label }) => (
                          <SelectItem
                            key={deviceId || speakerActiveDeviceId}
                            value={deviceId || speakerActiveDeviceId}
                            className="p-2.5 bg-background cursor-pointer"
                          >
                            {label || speakerActiveDeviceId}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="mt-2"
                    disabled={!speakerDevices?.[0]?.deviceId}
                  >
                    Test
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-[#1a73e8] font-medium mb-2">
                  General Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-join">
                      Automatically join meetings
                    </Label>
                    <Switch id="auto-join" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="mirror-video">Mirror my video</Label>
                    <Switch id="mirror-video" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="keyboard-shortcuts">
                      Enable keyboard shortcuts
                    </Label>
                    <Switch
                      id="keyboard-shortcuts"
                      disabled
                      onCheckedChange={() => {
                        toast.info("This feature is not available yet.", {
                          description: "Please check back later :)",
                        });
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
  );
}
