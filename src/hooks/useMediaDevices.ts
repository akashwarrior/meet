import {
  useMediaDeviceSelect,
  useRoomContext,
} from "@livekit/components-react";

export const useMediaDevices = () => {
  const room = useRoomContext();

  const audioDevices = useMediaDeviceSelect({
    kind: "audioinput",
    requestPermissions: false,
    room,
  });

  const videoDevices = useMediaDeviceSelect({
    kind: "videoinput",
    requestPermissions: false,
    room,
  });

  const speakerDevices = useMediaDeviceSelect({
    kind: "audiooutput",
    requestPermissions: false,
    room,
  });

  return { audioDevices, videoDevices, speakerDevices };
};
