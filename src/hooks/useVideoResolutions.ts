import { useMemo } from "react";
import useMeetingPrefsStore from "@/store/meetingPrefs";
import { type VideoPreset, VideoPresets } from "livekit-client";

export const loadVideoResolutions = async (
  deviceId: string,
): Promise<VideoPreset[]> => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: { ideal: deviceId },
    },
  });

  try {
    const track = stream.getVideoTracks()[0];
    const { width, height } = track?.getCapabilities() ?? {};

    return Object.values(VideoPresets).filter(
      (preset) =>
        preset.width <= Math.min(width?.max ?? 1920) &&
        preset.height <= Math.min(height?.max ?? 1080),
    );
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
};

export const useVideoResolutions = (deviceId?: string): Promise<VideoPreset[]> => {
  const setVideoPrefs = useMeetingPrefsStore((state) => state.setVideoPrefs);

  const resolutions = useMemo(async(): Promise<VideoPreset[]> => {
    if(!deviceId || !navigator.mediaDevices){
      return [];
    }
    
    const resolutions = await  loadVideoResolutions(deviceId);
    const highestRes = resolutions.at(-1);
    if (!highestRes) return resolutions;

    const selectedResolution = useMeetingPrefsStore.getState().resolution;
    if (!selectedResolution) {
      setVideoPrefs({
        resolution: {
          width: Math.min(highestRes.width, 1920),
          height: Math.min(highestRes.height, 1080),
          frameRate: highestRes.encoding.maxFramerate,
        },
      });
    }

    return resolutions;
  }, [deviceId]);

  return resolutions;
};
