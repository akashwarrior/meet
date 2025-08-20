"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LiveClock from "@/components/liveClock";
import useSidebarOpenStore from "@/store/sideBar";
import useMeetingPrefsStore from "@/store/meetingPrefs";
import {
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import {
  DisconnectButton,
  useLocalParticipant,
  useMediaDeviceSelect,
} from "@livekit/components-react";

export default function MeetingFooter() {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useSidebarOpenStore();
  const { isCameraEnabled, isMicrophoneEnabled, localParticipant } =
    useLocalParticipant();
  const { facingMode, resolution } = useMeetingPrefsStore(
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

  const toggleSidebar = (tab: "participants" | "chat" | null) => {
    if (sidebarOpen === tab) {
      setSidebarOpen(null);
    } else {
      setSidebarOpen(tab);
    }
  };

  const toggleVideo = async () => {
    try {
      await localParticipant.setCameraEnabled(
        !isCameraEnabled,
        {
          deviceId: videoDeviceId,
          facingMode: facingMode,
          resolution: resolution,
        }
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to toggle video", {
        description:
          err instanceof Error ? err.message : "Error toggling video",
      });
    }
  };

  const toggleMic = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(
        !isMicrophoneEnabled,
        {
          deviceId: audioDeviceId,
        }
      );
    } catch (err) {
      toast.error("Failed to toggle audio", {
        description:
          err instanceof Error ? err.message : "Error toggling audio",
      });
    }
  };

  const leaveCall = () => router.push("/");

  return (
    <footer className="bg-background border-t border-border py-3 flex items-center relative">

      <div className="text-sm text-muted-foreground absolute left-4 hidden sm:flex items-center">
        <LiveClock />
      </div>

      <div className="flex items-center gap-2 mx-auto">
        <Button
          size="icon"
          variant={isMicrophoneEnabled ? "default" : "secondary"}
          onClick={toggleMic}
          className="rounded-full h-11 w-11 transition-colors"
        >
          {!isMicrophoneEnabled ? <MicOff /> : <Mic />}
        </Button>

        <Button
          size="icon"
          variant={isCameraEnabled ? "default" : "secondary"}
          onClick={toggleVideo}
          className=
          "rounded-full h-11 w-11 transition-colors"
        >
          {!isCameraEnabled ? <VideoOff /> : <Video />}
        </Button>

        <Button
          onClick={() => toggleSidebar("chat")}
          variant={sidebarOpen === 'chat' ? "default" : "secondary"}
          size="icon"
          className="rounded-full h-11 w-11 transition-colors"
        >
          <MessageSquare />
        </Button>

        <Button
          onClick={() => toggleSidebar("participants")}
          variant={sidebarOpen === 'participants' ? "default" : "secondary"}
          size="icon"
          className="rounded-full h-11 w-11 transition-colors"
        >
          <Users />
        </Button>

        <DisconnectButton
          onClick={leaveCall}
          className={buttonVariants({ variant: "default" }) + " rounded-full! p-5!"}>
          <Phone className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Leave</span>
        </DisconnectButton>
      </div>
    </footer>
  );
}
