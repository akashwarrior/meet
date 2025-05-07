'use client'

import { useEffect, useState } from "react"
import { useRoom } from "@/hooks/useRoom";
import dynamic from "next/dynamic";
import PreMeeting from "../preMeeting";

const VideoGrid = dynamic(() => import("@/components/videoGrid"), { ssr: false })
const SideBar = dynamic(() => import("@/components/sideBar"), { ssr: false })
const MeetingHeader = dynamic(() => import("@/components/meetingHeader"), { ssr: false })
const MeetingFooter = dynamic(() => import("@/components/meetingFooter"), { ssr: false })

export default function Meeting({ meetingId }: { meetingId: string }) {
    const [isLoading, setIsLoading] = useState<"Loading" | "Connected" | "Disconnected">("Disconnected")
    const [username, setUserName] = useState("")
    const { room, localParticipant } = useRoom({ isLoading, setIsLoading, meetingId, username })

    useEffect(() => {
        return () => {
            room.disconnect();
        };
    }, [room])

    return (
        (isLoading !== 'Connected') ?
            <PreMeeting
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setName={setUserName}
            />
            :
            <main className="h-screen flex flex-col bg-background">
                <MeetingHeader meetingId={meetingId} />
                <div className="flex-1 flex overflow-hidden">
                    <VideoGrid />
                    <SideBar
                        room={room}
                        localParticipant={localParticipant}
                    />
                </div>
                <MeetingFooter localParticipant={localParticipant} />
            </main>
    )
}