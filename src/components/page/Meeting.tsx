'use client'

import dynamic from "next/dynamic"
import PreMeeting from "@/components/preMeeting"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { WebRTCService } from "@/lib/webrtc-service"
import useParticipantStore from "@/store/participant"
import useStreamTrackstore from "@/store/streamTrack"
import useMeetingPrefsStore from "@/store/meetingPrefs"

const MeetingFooter = dynamic(() => import("@/components/meetingFooter"), { ssr: false })
const MeetingHeader = dynamic(() => import("@/components/meetingHeader"), { ssr: false })
const VideoGrid = dynamic(() => import("@/components/videoGrid"), { ssr: false })
const SideBar = dynamic(() => import("@/components/sideBar"), { ssr: false })

export default function Meeting({ meetingId }: { meetingId: string }) {
    const { addParticipant, removeParticipant } = useParticipantStore()
    const { updateTracks } = useStreamTrackstore()
    const [webRTCService, setWebRTCService] = useState<WebRTCService | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [name, setName] = useState("")
    const { audio, video, meeting } = useMeetingPrefsStore();

    useEffect(() => {
        if (isLoading) return;
        if (!webRTCService) {
            WebRTCService
                .getInstance({
                    name,
                    meetingId,
                    isVideoEnabled: meeting.isVideoEnabled,
                    isAudioEnabled: meeting.isAudioEnabled,
                    videoResolution: video.videoResolution,
                    videoFrames: video.videoFrames,
                    videoCodec: video.videoCodec,
                    videoDeviceId: video.videoInputDevice?.deviceId,
                    audioDeviceId: audio.audioInputDevice?.deviceId,
                }).then((instance) => {
                    instance.onConnectionSuccess(() => {
                        setWebRTCService(instance);
                        setIsLoading(false);
                    })
                    instance.onParticipantJoined(addParticipant);
                    instance.onParticipantLeave(removeParticipant);
                    instance.onMediaTrack(updateTracks);
                }).catch((error) => {
                    toast.error("Error joining meeting", {
                        description: error.message,
                    })
                    setIsLoading(true);
                });
        }

        return () => {
            webRTCService?.close();
        }
    }, [isLoading, webRTCService, name, meetingId, addParticipant, removeParticipant, updateTracks]);

    return ((!webRTCService) ?
        <PreMeeting
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setName={setName}
        />
        :
        <main className="h-screen flex flex-col bg-background">
            <MeetingHeader
                meetingId={meetingId}
                service={webRTCService}
            />
            <div className="flex-1 flex overflow-hidden">
                <VideoGrid />
                <SideBar service={webRTCService} />
            </div>
            <MeetingFooter service={webRTCService} />
        </main>
    )
}