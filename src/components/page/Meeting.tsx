'use client'

import { useEffect, useRef } from "react"
import PreMeeting from "../preMeeting";
import { RoomContext } from "@livekit/components-react";
import { Room, ConnectionState } from "livekit-client";
import dynamic from "next/dynamic";

const VideoGrid = dynamic(() => import("@/components/videoGrid"), { ssr: false })
const SideBar = dynamic(() => import("@/components/sideBar"), { ssr: false })
const MeetingHeader = dynamic(() => import("@/components/meetingHeader"), { ssr: false })
const MeetingFooter = dynamic(() => import("@/components/meetingFooter"), { ssr: false })

export default function Meeting({ meetingId }: { meetingId: string }) {
    const roomRef = useRef<Room>(
        new Room({
            adaptiveStream: true,
            dynacast: true,
        })
    );

    useEffect(() => {
        return () => {
            roomRef.current.disconnect();
        };
    }, [roomRef])

    return (
        <RoomContext.Provider value={roomRef.current}>
            {(roomRef.current.state !== ConnectionState.Connected) ?
                <PreMeeting meetingId={meetingId} />
                :
                <main className="h-screen flex flex-col bg-background">
                    <MeetingHeader meetingId={meetingId} />
                    <div className="flex-1 flex overflow-hidden">
                        <VideoGrid />
                        <SideBar />
                    </div>
                    <MeetingFooter />
                </main>
            }
        </RoomContext.Provider>
    )
}