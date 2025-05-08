import useMeetingPrefsStore from "@/store/meetingPrefs"
import { useEffect, useState } from "react"

export function useGetMediaDevices() {
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
    const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([])
    const { setAudioPrefs, setVideoPrefs } = useMeetingPrefsStore()

    useEffect(() => {
        async function initializeDevices({ audio, video }: { audio: boolean, video: boolean }) {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices()
                const newAudioDevices: MediaDeviceInfo[] = []
                const newVideoDevices: MediaDeviceInfo[] = []
                const newSpeakerDevices: MediaDeviceInfo[] = []

                for (const device of devices) {
                    if (!device.deviceId) continue
                    switch (device.kind) {
                        case "audioinput":
                            newAudioDevices.push(device);
                            break;
                        case "audiooutput":
                            newSpeakerDevices.push(device);
                            break;
                        case "videoinput":
                            newVideoDevices.push(device);
                            break;
                    }
                }

                if (newSpeakerDevices.length) {
                    setSpeakerDevices(newSpeakerDevices)
                    setAudioPrefs({ audioOutputDevice: newSpeakerDevices[0] })
                }

                if (audio && newAudioDevices.length) {
                    setAudioDevices(newAudioDevices)
                    setAudioPrefs({ audioInputDevice: newAudioDevices[0] })
                }

                if (video && newVideoDevices.length) {
                    setVideoDevices(newVideoDevices)
                    setVideoPrefs({ videoInputDevice: newVideoDevices[0] })
                }
            } catch (error) {
                console.log("Error initializing devices:", error);
            }
        }


        // Check for permissions and initialize devices if not already
        navigator.permissions.query({ name: "camera" })
            .then((cameraResult) => {
                if (cameraResult.state !== "granted") {
                    cameraResult.onchange = () => {
                        if (cameraResult.state === "granted") {
                            initializeDevices({ audio: false, video: true })
                        }
                    }
                }
            });

        navigator.permissions.query({ name: "microphone" })
            .then((micResult) => {
                if (micResult.state !== "granted") {
                    micResult.onchange = () => {
                        if (micResult.state === "granted") {
                            initializeDevices({ audio: false, video: true })
                        }
                    }
                }
            });

        initializeDevices({ audio: true, video: true })

    }, [setAudioPrefs, setVideoPrefs])

    return { audioDevices, videoDevices, speakerDevices }
}