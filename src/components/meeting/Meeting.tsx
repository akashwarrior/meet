"use client";

import { useEffect, useState } from "react";
import PreMeeting from "./preMeeting";
import { RoomContext } from "@livekit/components-react";
import { Room } from "livekit-client";
import VideoGrid from "@/components/meeting/videoGrid";
import SideBar from "@/components/meeting/sideBar";
import MeetingHeader from "@/components/meeting/meetingHeader";
import MeetingFooter from "@/components/meeting/meetingFooter";

export default function Meeting({ meetingId }: { meetingId: string }) {
  const [ready, setReady] = useState(false);
  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          scalabilityMode: "L1T3",
          simulcast: true,
        },
      }),
  );

  useEffect(() => {
    roomInstance.on("connected", () => setReady(true));
    roomInstance.on("disconnected", () => setReady(false));
    return () => {
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  return (
    <RoomContext.Provider value={roomInstance}>
      {!ready ? (
        <PreMeeting meetingId={meetingId} />
      ) : (
        <main className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1)_0%,transparent_50%)] pointer-events-none" />

          <MeetingHeader meetingId={meetingId} />
          <div className="flex-1 flex overflow-hidden relative z-10">
            <VideoGrid />
            <SideBar />
          </div>
          <MeetingFooter />
        </main>
      )}
    </RoomContext.Provider>
  );
}
