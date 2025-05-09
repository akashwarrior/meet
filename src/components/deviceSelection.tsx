import * as motion from 'motion/react-m'
import { LazyMotion } from 'motion/react';
import { useGetMediaDevices } from "@/hooks/useGetMediaDevices"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ChevronDown, Mic, Volume2, Video } from 'lucide-react';
import useMeetingPrefsStore from '@/store/meetingPrefs';

const loadFeatures = () => import("@/components/domAnimation").then(res => res.default)

export default function DeviceSelection() {
    const { audioDevices, videoDevices, speakerDevices } = useGetMediaDevices();
    const audioInputDevice = useMeetingPrefsStore(state => state.audio.audioInputDevice);
    const audioOutputDevice = useMeetingPrefsStore(state => state.audio.audioOutputDevice);
    const videoInputDevice = useMeetingPrefsStore(state => state.video.videoInputDevice);
    const setAudioPrefs = useMeetingPrefsStore(state => state.setAudioPrefs);
    const setVideoPrefs = useMeetingPrefsStore(state => state.setVideoPrefs);

    return (
        <LazyMotion features={loadFeatures}>
            <div className="my-4 gap-4 hidden lg:flex items-center justify-start w-full">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-full flex items-center gap-3 px-4! focus-visible:ring-0 flex-1 max-w-1/4 border-0 hover:border hover:bg-primary/10! duration-200 shadow-none"
                            disabled={!audioDevices.length}
                        >
                            <Mic />
                            <motion.span
                                className="truncate"
                                key={audioInputDevice?.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                {audioInputDevice?.label || "Permission needed"}
                            </motion.span>
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="start"
                        className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0 "
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full h-full bg-background overflow-hidden"
                        >{audioDevices.map((device) =>
                            <DropdownMenuItem
                                key={device.deviceId}
                                onClick={() => setAudioPrefs({ audioInputDevice: device })}
                                className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === audioInputDevice?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                            >
                                {device.label}
                            </DropdownMenuItem>)}
                        </motion.div>

                    </DropdownMenuContent>
                </DropdownMenu>


                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-full flex items-center gap-3 px-4! focus-visible:ring-0 flex-1 max-w-1/4 border-0 hover:border hover:bg-primary/10! duration-200 shadow-none"
                            disabled={!speakerDevices.length}
                        >
                            <Volume2 />
                            <motion.span
                                className="truncate"
                                key={audioOutputDevice?.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                {audioOutputDevice?.label || "Permission needed"}
                            </motion.span>
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="start"
                        className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0 "
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full h-full bg-background overflow-hidden"
                        >{speakerDevices.map((device) =>
                            <DropdownMenuItem
                                key={device.deviceId}
                                onClick={() => setAudioPrefs({ audioOutputDevice: device })}
                                className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === audioOutputDevice?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                            >
                                {device.label}
                            </DropdownMenuItem>)}
                        </motion.div>

                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu modal={false} >
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-full flex items-center gap-3 px-4! focus-visible:ring-0 flex-1 max-w-1/4 border-0 hover:border hover:bg-primary/10! duration-200 shadow-none"
                            disabled={!videoDevices.length}
                        >
                            <Video />
                            <motion.span
                                className="truncate"
                                key={videoInputDevice?.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                {videoInputDevice?.label || "Permission needed"}
                            </motion.span>
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="start"
                        className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0 "
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full h-full bg-background overflow-hidden"
                        >{videoDevices.map((device) =>
                            <DropdownMenuItem
                                key={device.deviceId}
                                onClick={() => setVideoPrefs({ videoInputDevice: device })}
                                className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === videoInputDevice?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                            >
                                {device.label}
                            </DropdownMenuItem>)}
                        </motion.div>

                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </LazyMotion>
    )
}