'use client'

import { useEffect, useMemo, useState } from "react"
import PreMeeting from "../preMeeting";
import { RoomContext } from "@livekit/components-react";
import { Room, ConnectionState, VideoCaptureOptions } from "livekit-client";
import dynamic from "next/dynamic";
import useMeetingPrefsStore from "@/store/meetingPrefs";

const VideoGrid = dynamic(() => import("@/components/videoGrid"), { ssr: false })
const SideBar = dynamic(() => import("@/components/sideBar"), { ssr: false })
const MeetingHeader = dynamic(() => import("@/components/meetingHeader"), { ssr: false })
const MeetingFooter = dynamic(() => import("@/components/meetingFooter"), { ssr: false })

export default function Meeting({ meetingId }: { meetingId: string }) {
    const [render, setRender] = useState(false)
    const videoPrefs = useMeetingPrefsStore(state => state.video)
    const videoCaptureDefaults: VideoCaptureOptions = useMemo(() => ({
        facingMode: 'user',
        resolution: {
            width: videoPrefs.videoResolution.width,
            height: videoPrefs.videoResolution.height,
            frameRate: videoPrefs.videoFrames,
        },
    }), [videoPrefs])
    const [roomInstance] = useState<Room>(() => new Room({
        adaptiveStream: false,
        dynacast: false,
        videoCaptureDefaults,
        stopLocalTrackOnUnpublish: true,
        publishDefaults: {
            videoCodec: videoPrefs.videoCodec,
            scalabilityMode: 'L1T1',
            simulcast: false,
        }
    }));

    useEffect(() => {
        return () => {
            roomInstance.disconnect();
        };
    }, [roomInstance])

    useEffect(() => {
        roomInstance.options.videoCaptureDefaults = videoCaptureDefaults
        roomInstance.options.publishDefaults!.videoCodec = videoPrefs.videoCodec
    }, [videoPrefs, videoCaptureDefaults])

    return (
        <RoomContext.Provider value={roomInstance}>
            {(roomInstance.state !== ConnectionState.Connected) ?
                <PreMeeting meetingId={meetingId} handleConnect={() => { setRender(!render) }} />
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