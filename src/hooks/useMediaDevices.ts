import {
  useMediaDeviceSelect,
  useRoomContext,
} from "@livekit/components-react";

type MediaPermissionRequests = {
  audioInput?: boolean;
  videoInput?: boolean;
  audioOutput?: boolean;
};

export const useMediaDevices = (
  requestPermissions: MediaPermissionRequests = {},
) => {
  const room = useRoomContext();

  const audioDevices = useMediaDeviceSelect({
    kind: "audioinput",
    requestPermissions: requestPermissions.audioInput ?? false,
    room,
  });

  const videoDevices = useMediaDeviceSelect({
    kind: "videoinput",
    requestPermissions: requestPermissions.videoInput ?? false,
    room,
  });

  const speakerDevices = useMediaDeviceSelect({
    kind: "audiooutput",
    requestPermissions: requestPermissions.audioOutput ?? false,
    room,
  });

  return { audioDevices, videoDevices, speakerDevices };
};
