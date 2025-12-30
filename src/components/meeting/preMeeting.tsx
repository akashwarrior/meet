"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/header";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConnectionState, Track } from "livekit-client";
import useMeetingPrefsStore from "@/store/meetingPrefs";
import PermissionDialog from "./permissionDialog";
import DeviceSelection from "./deviceSelection";
import SettingsDialog from "./settingsDialog";
import { useSession } from "@/lib/auth/auth-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  useMediaDeviceSelect,
  usePreviewTracks,
  useRoomContext,
} from "@livekit/components-react";

const createMeetingTokenRequest = async (params: {
  meetingId: string;
  name: string;
}): Promise<{ token: string }> => {
  const response = await fetch(
    `/api/token?${new URLSearchParams(params).toString()}`,
    { cache: "no-store" },
  );
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson
    ? ((await response.json()) as { token?: string; error?: string })
    : ({ error: await response.text() } as { token?: string; error?: string });

  if (!response.ok || !payload.token) {
    throw new Error(payload.error ?? "Failed to create meeting token");
  }

  return { token: payload.token };
};

interface PreMeetingProps {
  meetingId: string;
}

export default function PreMeeting({ meetingId }: PreMeetingProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const room = useRoomContext();
  const { facingMode, resolution } = useMeetingPrefsStore(
    useShallow((state) => ({
      facingMode: state.facingMode,
      resolution: state.resolution,
    })),
  );
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
  const [videoPermissionGranted, setVideoPermissionGranted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [requestingAudio, setRequestingAudio] = useState(false);
  const [requestingVideo, setRequestingVideo] = useState(false);
  const { activeDeviceId: audioDeviceId } = useMediaDeviceSelect({
    kind: "audioinput",
    requestPermissions: false,
    room,
  });
  const { activeDeviceId: videoDeviceId } = useMediaDeviceSelect({
    kind: "videoinput",
    requestPermissions: false,
    room,
  });

  const tracks = usePreviewTracks({
    video: isVideoEnabled
      ? { deviceId: videoDeviceId, facingMode, resolution }
      : false,
    audio: isAudioEnabled ? { deviceId: audioDeviceId } : false,
  });

  useEffect(() => {
    const videoTrack = tracks?.find((track) => track.kind === Track.Kind.Video);

    if (videoRef.current && videoTrack) {
      videoTrack.unmute();
      videoTrack.attach(videoRef.current);
    }

    return () => {
      videoTrack?.detach();
    };
  }, [tracks]);

  useEffect(() => {
    if (!navigator.permissions) {
      return;
    }

    let cameraPermission: PermissionStatus | null = null;
    let micPermission: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      const isAudioGranted = micPermission?.state === "granted";
      const isVideoGranted = cameraPermission?.state === "granted";
      setAudioPermissionGranted(Boolean(isAudioGranted));
      setVideoPermissionGranted(Boolean(isVideoGranted));

      if (isVideoGranted || isAudioGranted) {
        setShowDialog(false);
      }
    };

    const initializePermissions = async () => {
      try {
        const [cameraResult, micResult] = await Promise.all([
          navigator.permissions.query({ name: "camera" as PermissionName }),
          navigator.permissions.query({ name: "microphone" as PermissionName }),
        ]);

        cameraPermission = cameraResult;
        micPermission = micResult;

        setAudioPermissionGranted(micResult.state === "granted");
        setVideoPermissionGranted(cameraResult.state === "granted");

        if (cameraResult.state === "prompt" && micResult.state === "prompt") {
          setShowDialog(true);
        }

        cameraResult.addEventListener("change", handlePermissionChange);
        micResult.addEventListener("change", handlePermissionChange);
      } catch (error) {
        console.warn("Failed to query permissions:", error);
      }
    };

    void initializePermissions();

    return () => {
      if (cameraPermission) {
        cameraPermission.removeEventListener("change", handlePermissionChange);
      }
      if (micPermission) {
        micPermission.removeEventListener("change", handlePermissionChange);
      }
    };
  }, []);

  const requestMediaPermission = async (
    constraints: MediaStreamConstraints,
    kind: "audio" | "video",
  ): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Media devices are not available in this browser.");
      return false;
    }

    if (kind === "audio") {
      setRequestingAudio(true);
    } else {
      setRequestingVideo(true);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach((track) => track.stop());
      if (kind === "audio") {
        setAudioPermissionGranted(true);
      } else {
        setVideoPermissionGranted(true);
      }
      setShowDialog(false);
      return true;
    } catch (error) {
      toast.error(
        kind === "audio"
          ? "Microphone permission needed"
          : "Camera permission needed",
        {
          description:
            error instanceof Error
              ? "Please allow access in the browser prompt and try again."
              : "Please allow access and try again.",
        },
      );
      return false;
    } finally {
      if (kind === "audio") {
        setRequestingAudio(false);
      } else {
        setRequestingVideo(false);
      }
    }
  };

  const toggleAudio = async () => {
    if (isAudioEnabled) {
      setIsAudioEnabled(false);
      return;
    }

    const granted = await requestMediaPermission(
      { audio: true, video: false },
      "audio",
    );
    if (granted) {
      setIsAudioEnabled(true);
    }
  };

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      setIsVideoEnabled(false);
      return;
    }

    const granted = await requestMediaPermission(
      { audio: false, video: true },
      "video",
    );
    if (granted) {
      setIsVideoEnabled(true);
    }
  };

  return (
    <div className="min-h-[90vh] bg-background flex flex-col items-center justify-center">
      <Header />
      <main className="flex flex-col lg:flex-row gap-20 md:gap-5 items-center justify-around m-auto w-11/12">
        <div className="w-full flex flex-col items-center lg:items-start relative lg:max-w-8/12">
          <div className="relative w-full h-full rounded-xl overflow-hidden sm:max-w-11/12 aspect-video">
            {isVideoEnabled ? (
              <video
                autoPlay
                playsInline
                muted
                ref={videoRef}
                className="w-full h-full max-w-full max-h-full -scale-x-100 object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-950/90 flex">
                <div className="text-white text-2xl m-auto">Camera is off</div>
              </div>
            )}

            <VideoControls
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              toggleAudio={toggleAudio}
              toggleVideo={toggleVideo}
              requestingAudio={requestingAudio}
              requestingVideo={requestingVideo}
            />
          </div>

          <DeviceSelection
            key={`${Number(audioPermissionGranted)}-${Number(videoPermissionGranted)}`}
            requestPermissions={{
              audioInput: audioPermissionGranted,
              videoInput: videoPermissionGranted,
              audioOutput: audioPermissionGranted || videoPermissionGranted,
            }}
          />
        </div>

        <JoinMeeting
          meetingId={meetingId}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          videoDeviceId={videoDeviceId}
        />
      </main>

      <PermissionDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        setIsAudioEnabled={setIsAudioEnabled}
        setIsVideoEnabled={setIsVideoEnabled}
        onPermissionGranted={(kind) => {
          if (kind === "audio") {
            setAudioPermissionGranted(true);
            return;
          }
          if (kind === "video") {
            setVideoPermissionGranted(true);
            return;
          }
          setAudioPermissionGranted(true);
          setVideoPermissionGranted(true);
        }}
      />
    </div>
  );
}

const VideoControls = ({
  isAudioEnabled,
  isVideoEnabled,
  toggleAudio,
  toggleVideo,
  requestingAudio,
  requestingVideo,
}: {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  requestingAudio: boolean;
  requestingVideo: boolean;
}) => {
  return (
    <>
      <div className="absolute bottom-0 flex gap-6 left-0 right-0 items-center justify-center inset-shadow-black bg-linear-to-t from-black/60 to-transparent py-4">
        <Button
          size="icon"
          className={`rounded-full p-6 md:p-6.5 flex border-none ring-1 ${isAudioEnabled ? "bg-transparent hover:bg-white/40" : "hover:bg-red-700 bg-red-500 ring-transparent"}`}
          onClick={() => void toggleAudio()}
          disabled={requestingAudio}
        >
          {isAudioEnabled ? (
            <Mic className="md:w-5! md:h-5!" />
          ) : (
            <MicOff className="md:w-5! md:h-5!" />
          )}
        </Button>

        <Button
          size="icon"
          className={`rounded-full p-6 md:p-6.5 flex border-none ring-1 ${isVideoEnabled ? "bg-transparent hover:bg-white/40" : "hover:bg-red-700 bg-red-500 ring-transparent"}`}
          onClick={() => void toggleVideo()}
          disabled={requestingVideo}
        >
          {isVideoEnabled ? (
            <Video className="md:w-5! md:h-5!" />
          ) : (
            <VideoOff className="md:w-5! md:h-5!" />
          )}
        </Button>
      </div>

      <div className="absolute top-0 left-0 right-0 flex bg-linear-to-b from-black/50 to-transparent p-3 justify-end items-center">
        <SettingsDialog />
      </div>
    </>
  );
};

const JoinMeeting = ({
  meetingId,
  isAudioEnabled,
  isVideoEnabled,
  videoDeviceId,
}: {
  meetingId: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  videoDeviceId: string;
}) => {
  const room = useRoomContext();
  const { data: session } = useSession();
  const { facingMode, resolution, videoCodec } = useMeetingPrefsStore(
    useShallow((state) => ({
      facingMode: state.facingMode,
      resolution: state.resolution,
      videoCodec: state.videoCodec,
    })),
  );
  const { activeDeviceId: audioDeviceId } = useMediaDeviceSelect({
    kind: "audioinput",
    requestPermissions: false,
    room,
  });
  const nameRef = useRef<HTMLInputElement>(null);

  const handleJoinMeeting = async () => {
    const username = nameRef.current?.value.trim();
    if (!username) {
      toast.error("Name Required", {
        description: "Please enter your name to join the meeting",
      });
      return;
    }

    const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() ?? "";

    if (!liveKitUrl) {
      toast.error("Failed to connect to the server", {
        description: "LiveKit is not configured correctly",
      });
      return;
    }
    try {
      const { token } = await createMeetingTokenRequest({
        meetingId,
        name: username,
      });

      await room.connect(liveKitUrl, token);

      const cameraPromise = room.localParticipant.setCameraEnabled(
        isVideoEnabled,
        {
          deviceId: videoDeviceId,
          facingMode: facingMode,
          resolution: resolution,
          frameRate: resolution?.frameRate,
        },
        {
          videoCodec: videoCodec,
        },
      );

      const microphonePromise = room.localParticipant.setMicrophoneEnabled(
        isAudioEnabled,
        {
          deviceId: audioDeviceId,
        },
      );

      await Promise.all([cameraPromise, microphonePromise]);
    } catch (err) {
      room.disconnect();
      toast.error("Failed to connect to the server", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col gap-7 items-center my-10">
      <h1 className="text-2xl text-foreground">What&apos;s your name?</h1>
      <Input
        type="text"
        name="name"
        placeholder="Your name"
        ref={nameRef}
        defaultValue={session?.user?.name || ""}
        disabled={room.state === ConnectionState.Connecting}
        className="border rounded-md h-full bg-background focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 p-4.5 md:text-base"
      />

      <Button
        variant="default"
        className="text-base font-bold rounded-full px-16 py-7 mt-2"
        onClick={handleJoinMeeting}
        disabled={room.state === ConnectionState.Connecting}
      >
        {room.state === ConnectionState.Connecting
          ? "Joining..."
          : "Join Meeting"}
      </Button>
    </div>
  );
};
