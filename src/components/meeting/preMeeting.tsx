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
import { EllipsisVertical, Mic, MicOff, Video, VideoOff } from "lucide-react";
import {
  useMediaDeviceSelect,
  useRoomContext,
  usePreviewTracks,
} from "@livekit/components-react";

interface PreMeetingProps {
  meetingId: string;
}

export default function PreMeeting({ meetingId }: PreMeetingProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isVideoEnabled = useMeetingPrefsStore((s) => s.meeting.isVideoEnabled);
  const { facingMode, resolution } = useMeetingPrefsStore((s) => s.video);
  const [showDialog, setShowDialog] = useState(false);
  const { activeDeviceId: deviceId } = useMediaDeviceSelect({
    kind: "videoinput",
    requestPermissions: false,
    room: useRoomContext(),
  });

  const tracks = usePreviewTracks({
    video: isVideoEnabled ? { deviceId, facingMode, resolution } : false,
  });

  useEffect(() => {
    const videoTrack = tracks?.filter(
      (track) => track.kind === Track.Kind.Video,
    )[0];

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
      if (
        cameraPermission?.state === "granted" ||
        micPermission?.state === "granted"
      ) {
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

        if (cameraResult.state === "prompt" && micResult.state === "prompt") {
          setShowDialog(true);
        }

        cameraResult.addEventListener("change", handlePermissionChange);
        micResult.addEventListener("change", handlePermissionChange);
      } catch (error) {
        console.warn("Failed to query permissions:", error);
      }
    };

    initializePermissions();

    return () => {
      if (cameraPermission) {
        cameraPermission.removeEventListener("change", handlePermissionChange);
      }
      if (micPermission) {
        micPermission.removeEventListener("change", handlePermissionChange);
      }
    };
  }, []);

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

            <VideoControls />
          </div>

          {!showDialog ? <DeviceSelection /> : <DeviceSelection />}
        </div>

        <JoinMeeting meetingId={meetingId} />
      </main>

      <PermissionDialog showDialog={showDialog} setShowDialog={setShowDialog} />
    </div>
  );
}

const VideoControls = () => {
  const { isAudioEnabled, isVideoEnabled } = useMeetingPrefsStore(
    (s) => s.meeting,
  );
  const setMeetingPrefs = useMeetingPrefsStore((s) => s.setMeetingPrefs);

  return (
    <>
      <div className="absolute bottom-0 flex gap-6 left-0 right-0 items-center justify-center inset-shadow-black bg-gradient-to-t from-black/60 to-transparent py-4">
        <Button
          size="icon"
          className={`rounded-full p-6 md:p-6.5 flex border-none ring-1 ${isAudioEnabled ? "bg-transparent hover:bg-white/40" : "hover:bg-red-700 bg-red-500 ring-transparent"}`}
          onClick={() => setMeetingPrefs({ isAudioEnabled: !isAudioEnabled })}
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
          onClick={() => setMeetingPrefs({ isVideoEnabled: !isVideoEnabled })}
        >
          {isVideoEnabled ? (
            <Video className="md:w-5! md:h-5!" />
          ) : (
            <VideoOff className="md:w-5! md:h-5!" />
          )}
        </Button>
      </div>

      <div className="absolute top-0 left-0 right-0 flex bg-gradient-to-b from-black/50 to-transparent p-3 justify-end items-center">
        <SettingsDialog>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-primary/50"
          >
            <EllipsisVertical className="w-5! h-5!" />
          </Button>
        </SettingsDialog>
      </div>
    </>
  );
};

const JoinMeeting = ({ meetingId }: { meetingId: string }) => {
  const { connect, state, localParticipant } = useRoomContext();
  const { data: session } = useSession();
  const { isVideoEnabled, isAudioEnabled } = useMeetingPrefsStore(
    (s) => s.meeting,
  );
  const { facingMode, resolution, videoCodec } = useMeetingPrefsStore(
    (s) => s.video,
  );
  const { activeDeviceId: videoDeviceId } = useMediaDeviceSelect({
    kind: "videoinput",
    requestPermissions: false,
  });
  const { activeDeviceId: audioDeviceId } = useMediaDeviceSelect({
    kind: "audioinput",
    requestPermissions: false,
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
    try {
      const res = await fetch(
        `/api/token?meetingId=${meetingId}&name=${username}`,
      );
      const data = await res.json();
      if (data.token) {
        await connect(
          process.env.NEXT_PUBLIC_LIVEKIT_URL as string,
          data.token,
        );

        const cameraPromise = localParticipant.setCameraEnabled(
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

        const microphonePromise = localParticipant.setMicrophoneEnabled(
          isAudioEnabled,
          {
            deviceId: audioDeviceId,
          },
        );

        await Promise.all([cameraPromise, microphonePromise]);
      } else {
        throw new Error(data.error || "Failed to get token");
      }
    } catch (err) {
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
        disabled={state === ConnectionState.Connecting}
        className="border rounded-md h-full bg-background focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 p-4.5 md:text-base"
      />

      <Button
        variant="default"
        className="text-base font-bold rounded-full px-16 py-7 mt-2"
        onClick={handleJoinMeeting}
        disabled={state === ConnectionState.Connecting}
      >
        {state === ConnectionState.Connecting ? "Joining..." : "Join Meeting"}
      </Button>
    </div>
  );
};
