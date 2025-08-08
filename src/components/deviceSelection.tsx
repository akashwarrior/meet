import { Button } from "./ui/button";
import { motion } from "motion/react";
import { useMediaDeviceSelect } from "@livekit/components-react";
import { ChevronDown, Mic, Volume2, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function DeviceSelection() {
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

  return (
    <div className="my-4 gap-3 hidden lg:flex items-center justify-start w-full">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full flex items-center gap-3 px-4! flex-1 max-w-1/4 hover:bg-primary/10! duration-200 shadow-none border-none"
            disabled={!audioDevices?.[0]?.deviceId}
          >
            <Mic />
            <motion.span
              className="truncate"
              key={audioActiveDeviceId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {audioDevices?.[0]?.deviceId
                ? audioDevices.find(
                  (device) => device.deviceId === audioActiveDeviceId,
                )?.label || audioDevices[0].label
                : "Permission needed"}
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
          >
            {audioDevices.map((device) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => setAudioActiveDevice(device.deviceId)}
                className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === audioActiveDeviceId && "bg-primary/15 hover:bg-primary/20!"}`}
              >
                {device.label}
              </DropdownMenuItem>
            ))}
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full flex items-center gap-3 px-4! flex-1 max-w-1/4 hover:bg-primary/10! duration-200 shadow-none border-none"
            disabled={!speakerDevices?.[0]?.deviceId}
          >
            <Volume2 />
            <motion.span
              className="truncate"
              key={speakerActiveDeviceId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {speakerDevices?.[0]?.deviceId
                ? speakerDevices.find(
                  (device) => device.deviceId === speakerActiveDeviceId,
                )?.label || speakerDevices[0].label
                : "Permission needed"}
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
          >
            {speakerDevices.map((device) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => setSpeakerActiveDevice(device.deviceId)}
                className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === speakerActiveDeviceId && "bg-primary/15 hover:bg-primary/20!"}`}
              >
                {device.label}
              </DropdownMenuItem>
            ))}
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full flex items-center gap-3 px-4! flex-1 max-w-1/4 hover:bg-primary/10! duration-200 shadow-none border-none"
            disabled={!videoDevices?.[0]?.deviceId}
          >
            <Video />
            <motion.span
              className="truncate"
              key={videoActiveDeviceId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {videoDevices?.[0]?.deviceId
                ? videoDevices.find(
                  (device) => device.deviceId === videoActiveDeviceId,
                )?.label || videoDevices[0].label
                : "Permission needed"}
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
          >
            {videoDevices.map((device) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => setVideoActiveDevice(device.deviceId)}
                className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === videoActiveDeviceId && "bg-primary/15 hover:bg-primary/20!"}`}
              >
                {device.label}
              </DropdownMenuItem>
            ))}
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
