"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import PreMeeting from "./preMeeting";
import { RoomContext } from "@livekit/components-react";
import { Room } from "livekit-client";

const MeetingConnectedShell = dynamic(
  () => import("@/components/meeting/meetingConnectedShell"),
  {
    ssr: false,
  },
);

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
    const onConnected = () => setReady(true);
    const onDisconnected = () => setReady(false);

    roomInstance.on("connected", onConnected);
    roomInstance.on("disconnected", onDisconnected);

    return () => {
      roomInstance.off("connected", onConnected);
      roomInstance.off("disconnected", onDisconnected);
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  return (
    <RoomContext.Provider value={roomInstance}>
      {!ready ? (
        <PreMeeting meetingId={meetingId} />
      ) : (
        <MeetingConnectedShell meetingId={meetingId} />
      )}
    </RoomContext.Provider>
  );
}
