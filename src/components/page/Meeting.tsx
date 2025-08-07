"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PreMeeting from "../preMeeting";
import { RoomContext } from "@livekit/components-react";
import { Room, ConnectionState, AudioPresets } from "livekit-client";

const VideoGrid = dynamic(() => import("@/components/videoGrid"), {
  ssr: false,
});
const SideBar = dynamic(() => import("@/components/sideBar"), { ssr: false });
const MeetingHeader = dynamic(() => import("@/components/meetingHeader"), {
  ssr: false,
});
const MeetingFooter = dynamic(() => import("@/components/meetingFooter"), {
  ssr: false,
});

export default function Meeting({ meetingId }: { meetingId: string }) {
  const [render, setRender] = useState(false);
  const [roomInstance] = useState<Room>(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          scalabilityMode: "L1T1",
          simulcast: false,
          audioPreset: AudioPresets.musicHighQualityStereo,
          dtx: false,
          red: false,
        },
      }),
  );

  useEffect(() => {
    roomInstance.on("connected", () => setRender(!render));
    roomInstance.on("disconnected", () => setRender(!render));
    return () => {
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  return (
    <RoomContext.Provider value={roomInstance}>
      {roomInstance.state !== ConnectionState.Connected ? (
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
