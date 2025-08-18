"use client";

import { useEffect, useRef } from "react";
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

export default function PreMeeting({ meetingId }: { meetingId: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isVideoEnabled = useMeetingPrefsStore(
    (state) => state.meeting.isVideoEnabled,
  );
  const { facingMode, resolution } = useMeetingPrefsStore(
    (state) => state.video,
  );
  const { activeDeviceId: deviceId } = useMediaDeviceSelect({
    kind: "videoinput",
    requestPermissions: false,
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

          <DeviceSelection />
        </div>

        <JoinMeeting meetingId={meetingId} />
      </main>

      <PermissionDialog />
    </div>
  );
}

const VideoControls = () => {
  const isAudioEnabled = useMeetingPrefsStore(
    (state) => state.meeting.isAudioEnabled,
  );
  const isVideoEnabled = useMeetingPrefsStore(
    (state) => state.meeting.isVideoEnabled,
  );
  const setMeetingPrefs = useMeetingPrefsStore(
    (state) => state.setMeetingPrefs,
  );

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
  const { connect, state, options, localParticipant } = useRoomContext();
  const { data: session } = useSession();
  const nameRef = useRef<HTMLInputElement>(null);
  const { isVideoEnabled, isAudioEnabled } = useMeetingPrefsStore(
    (state) => state.meeting,
  );
  const { facingMode, resolution, videoCodec } = useMeetingPrefsStore(
    (state) => state.video,
  );
  const { activeDeviceId: videoDeviceId } = useMediaDeviceSelect({
    kind: "videoinput",
    requestPermissions: false,
  });
  const { activeDeviceId: audioDeviceId } = useMediaDeviceSelect({
    kind: "audioinput",
    requestPermissions: false,
  });

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
        `/api/token?meetingId=${meetingId}&username=${username}`,
      );
      const data = await res.json();
      if (data.token) {
        options.publishDefaults!.videoCodec = videoCodec;
        options.videoCaptureDefaults!.facingMode = facingMode;
        options.videoCaptureDefaults!.deviceId = videoDeviceId;
        options.videoCaptureDefaults!.resolution = resolution;
        await connect(
          process.env.NEXT_PUBLIC_LIVEKIT_URL as string,
          data.token,
        );
        await localParticipant.setCameraEnabled(isVideoEnabled, {
          deviceId: videoDeviceId,
          facingMode: facingMode,
          resolution: resolution,
        });
        await localParticipant.setMicrophoneEnabled(isAudioEnabled, {
          deviceId: audioDeviceId,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
        });
      } else {
        throw new Error("Failed to connect to the server");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect to the server");
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
