"use client";

import { useEffect, useState } from "react";
import PreMeeting from "../preMeeting";
import { RoomContext } from "@livekit/components-react";
import { Room } from "livekit-client";
import VideoGrid from "@/components/videoGrid";
import SideBar from "@/components/sideBar";
import MeetingHeader from "@/components/meetingHeader";
import MeetingFooter from "@/components/meetingFooter";

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
        <main className="h-screen flex flex-col bg-background">
          <MeetingHeader meetingId={meetingId} />
          <div className="flex-1 flex overflow-hidden">
            <VideoGrid />
            <SideBar />
          </div>
          <MeetingFooter />
        </main>
      )}
    </RoomContext.Provider>
  );
}
