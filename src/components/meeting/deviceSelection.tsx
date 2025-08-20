import { Button } from "@/components/ui/button";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { ChevronDown, Mic, Volume2, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DeviceDropdownProps {
  icon: React.ReactNode;
  devices: MediaDeviceInfo[];
  activeDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
  placeholder: string;
}

const DeviceDropdown = ({
  icon,
  devices,
  activeDeviceId,
  onDeviceChange,
  placeholder,
}: DeviceDropdownProps) => {
  const hasDevices = devices?.[0]?.deviceId;
  const activeDevice = hasDevices
    ? devices.find((device) => device.deviceId === activeDeviceId)
    : null;
  const displayLabel = activeDevice?.label || devices[0]?.label || placeholder;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full flex items-center gap-3 px-4 flex-1 max-w-1/4 hover:bg-primary/10 duration-200 shadow-none border-none"
          disabled={!hasDevices}
        >
          <div className="p-1 rounded-md text-primary">{icon}</div>
          <span className="truncate text-foreground">
            {hasDevices ? displayLabel : "Permission needed"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0"
      >
        <div className="w-full h-full bg-background overflow-hidden">
          {devices.map((device) => (
            <DropdownMenuItem
              key={device.deviceId}
              onClick={() => onDeviceChange(device.deviceId)}
              className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${
                device.deviceId === activeDeviceId
                  ? "bg-primary/15 hover:bg-primary/20"
                  : ""
              }`}
            >
              {device.label}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function DeviceSelection() {
  const {
    audioDevices: {
      activeDeviceId: audioActiveDeviceId,
      devices: audioDevices,
      setActiveMediaDevice: setAudioActiveDevice,
    },
    videoDevices: {
      activeDeviceId: videoActiveDeviceId,
      devices: videoDevices,
      setActiveMediaDevice: setVideoActiveDevice,
    },
    speakerDevices: {
      activeDeviceId: speakerActiveDeviceId,
      devices: speakerDevices,
      setActiveMediaDevice: setSpeakerActiveDevice,
    },
  } = useMediaDevices();

  return (
    <div className="my-4 gap-3 hidden lg:flex items-center justify-start w-full">
      <DeviceDropdown
        icon={<Mic className="h-4 w-4" />}
        devices={audioDevices}
        activeDeviceId={audioActiveDeviceId}
        onDeviceChange={setAudioActiveDevice}
        placeholder="Microphone"
      />

      <DeviceDropdown
        icon={<Volume2 className="h-4 w-4" />}
        devices={speakerDevices}
        activeDeviceId={speakerActiveDeviceId}
        onDeviceChange={setSpeakerActiveDevice}
        placeholder="Speaker"
      />

      <DeviceDropdown
        icon={<Video className="h-4 w-4" />}
        devices={videoDevices}
        activeDeviceId={videoActiveDeviceId}
        onDeviceChange={setVideoActiveDevice}
        placeholder="Camera"
      />
    </div>
  );
}
