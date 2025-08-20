import { toast } from "sonner";
import { useEffect, useState } from "react";
import { type VideoPreset, VideoPresets } from "livekit-client";
import useMeetingPrefsStore from "@/store/meetingPrefs";

export const useVideoResolutions = (videoDevices: MediaDeviceInfo[]) => {
  const [resolutions, setResolutions] = useState<VideoPreset[]>([]);
  const { resolution } = useMeetingPrefsStore((state) => state.video);
  const setVideoPrefs = useMeetingPrefsStore((state) => state.setVideoPrefs);

  useEffect(() => {
    if (
      !navigator.mediaDevices ||
      !videoDevices.length ||
      !videoDevices[0].deviceId
    ) {
      return;
    }

    const initializeResolutions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const { width, height } = stream.getVideoTracks()[0].getCapabilities();

        stream.getTracks().forEach((track) => track.stop());

        const availableResolutions = Object.values(VideoPresets).filter(
          (res) =>
            res.width <= (width?.max || 1920) &&
            res.height <= (height?.max || 1080),
        );

        setResolutions(availableResolutions);

        const highestRes =
          availableResolutions[availableResolutions.length - 1];
        if (highestRes && !resolution) {
          setVideoPrefs({
            resolution: {
              width: highestRes.width,
              height: highestRes.height,
              frameRate: highestRes.encoding.maxFramerate,
            },
          });
        }
      } catch (error) {
        console.error("Error getting devices:", error);
        toast.error("Error getting devices. Please check your permissions.");
      }
    };

    initializeResolutions();
  }, [videoDevices]);

  return resolutions;
};
