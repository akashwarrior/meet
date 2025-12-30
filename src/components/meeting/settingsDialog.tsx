"use client";

import { cn } from "@/lib/utils";
import { use, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useMeetingPrefsStore, { Codecs } from "@/store/meetingPrefs";
import { useShallow } from "zustand/react/shallow";
import { useVideoResolutions } from "@/hooks/useVideoResolutions";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  Volume2,
  X,
  Camera,
  Mic,
  Speaker,
  Monitor,
  Settings,
  EllipsisVertical,
} from "lucide-react";

interface DeviceSelectProps {
  icon: React.ReactNode;
  title: string;
  devices: MediaDeviceInfo[];
  activeDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
}

const TABS = [
  {
    label: "Video" as const,
    icon: Video,
  },
  {
    label: "Audio" as const,
    icon: Volume2,
  },
];

const CODECS: Codecs[] = ["vp8", "h264", "vp9", "av1"];
const FACING_MODES = ["user", "environment", "left", "right"] as const;

const DeviceSelect = ({
  icon,
  title,
  devices,
  activeDeviceId,
  onDeviceChange,
}: DeviceSelectProps) => {
  const hasDevices = devices?.[0]?.deviceId;
  const selectedDevice = hasDevices
    ? devices.find((device) => device.deviceId === activeDeviceId)?.deviceId ||
      devices[0].deviceId
    : "no-permission";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-primary/10">{icon}</div>
        <Label className="text-sm font-medium">{title}</Label>
        {hasDevices && (
          <span className="text-xs text-muted-foreground ml-auto">
            {devices.length} device{devices.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Select
          value={selectedDevice}
          onValueChange={onDeviceChange}
          disabled={!hasDevices}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={`Select ${title.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {hasDevices ? (
                devices.map(({ deviceId, label }) => (
                  <SelectItem key={deviceId} value={deviceId}>
                    {label || "Unknown Device"}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-permission" disabled>
                  Permission required
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

type MediaDevices = ReturnType<typeof useMediaDevices>;

const VideoSettings = ({
  videoDevices,
}: {
  videoDevices: MediaDevices["videoDevices"];
}) => {
  const resolutions = use(useVideoResolutions(videoDevices.activeDeviceId));
  const { resolution, videoCodec, facingMode, setVideoPrefs } =
    useMeetingPrefsStore(
      useShallow((state) => ({
        resolution: state.resolution,
        videoCodec: state.videoCodec,
        facingMode: state.facingMode,
        setVideoPrefs: state.setVideoPrefs,
      })),
    );

  return (
    <div className="space-y-4">
      <DeviceSelect
        icon={<Camera className="h-4 w-4" />}
        title="Camera"
        devices={videoDevices.devices}
        activeDeviceId={videoDevices.activeDeviceId}
        onDeviceChange={videoDevices.setActiveMediaDevice}
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Video Quality</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Resolution
            </Label>
            <Select
              value={resolution?.height.toString()}
              onValueChange={(resolutionHeight) => {
                const resHeight = parseInt(resolutionHeight);
                const res = resolutions.find((res) => res.height === resHeight);
                if (!res) return;
                setVideoPrefs({
                  resolution: {
                    width: res.width,
                    height: res.height,
                    frameRate: res.encoding.maxFramerate,
                  },
                });
              }}
              disabled={!videoDevices.devices?.[0]?.deviceId}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {resolutions.map(({ height, width }) => (
                    <SelectItem key={height} value={height.toString()}>
                      {width}×{height}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Codec
            </Label>
            <Select
              value={videoCodec}
              onValueChange={(codec) =>
                setVideoPrefs({ videoCodec: codec as Codecs })
              }
              disabled={!videoDevices.devices?.[0]?.deviceId}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Codec" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CODECS.map((codec) => (
                    <SelectItem key={codec} value={codec}>
                      {codec.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Frame Rate
            </Label>
            <Select
              value={resolution?.frameRate?.toString() || "0"}
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
              disabled={!videoDevices.devices?.[0]?.deviceId}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="FPS" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {resolutions
                    .filter((res) => res.height === resolution?.height)
                    .map(({ encoding: { maxFramerate } }) => (
                      <SelectItem
                        key={maxFramerate}
                        value={maxFramerate?.toString() || "0"}
                      >
                        {maxFramerate} fps
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Camera Settings</h3>
        </div>

        <div className="max-w-xs">
          <Label className="text-xs font-medium text-muted-foreground">
            Facing Mode
          </Label>
          <Select
            value={facingMode}
            onValueChange={(facingMode) =>
              setVideoPrefs({
                facingMode: facingMode as (typeof FACING_MODES)[number],
              })
            }
          >
            <SelectTrigger className="h-8 text-sm mt-1">
              <SelectValue placeholder="Select facing mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {FACING_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

const AudioSettings = ({
  audioDevices,
  speakerDevices,
}: {
  audioDevices: MediaDevices["audioDevices"];
  speakerDevices: MediaDevices["speakerDevices"];
}) => {
  return (
    <div className="space-y-4">
      <DeviceSelect
        icon={<Mic className="h-4 w-4" />}
        title="Microphone"
        devices={audioDevices.devices}
        activeDeviceId={audioDevices.activeDeviceId}
        onDeviceChange={audioDevices.setActiveMediaDevice}
      />

      <DeviceSelect
        icon={<Speaker className="h-4 w-4" />}
        title="Speaker"
        devices={speakerDevices.devices}
        activeDeviceId={speakerDevices.activeDeviceId}
        onDeviceChange={speakerDevices.setActiveMediaDevice}
      />
    </div>
  );
};

export default function SettingsDialog() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["label"]>("Video");
  const [open, setOpen] = useState(false);
  const { audioDevices, speakerDevices, videoDevices } = useMediaDevices();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full text-white hover:bg-primary/50"
        >
          <EllipsisVertical className="w-5! h-5!" />
        </Button>
      </DialogTrigger>

      <DialogTitle />

      {open ? (
        <DialogContent
          showCloseButton={false}
          className="overflow-hidden p-0 bg-background outline-none shadow-lg gap-0"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Settings</h1>
                <p className="text-xs text-muted-foreground">
                  Configure preferences
                </p>
              </div>
            </div>
            <DialogClose asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </DialogClose>
          </div>

          <div className="border-b border-border bg-muted/30 flex">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-all",
                    isActive &&
                      "text-primary border-b-2 border-primary bg-background",
                    !isActive &&
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === "Video" ? (
              <VideoSettings videoDevices={videoDevices} />
            ) : (
              <AudioSettings
                audioDevices={audioDevices}
                speakerDevices={speakerDevices}
              />
            )}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
