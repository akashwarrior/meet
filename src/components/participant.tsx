"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { Mic, MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useParticipantTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

const Participant = memo(
  ({
    identity,
    userName,
    isCameraEnabled,
    isMicrophoneEnabled,
  }: {
    identity: string;
    userName: string;
    isCameraEnabled: boolean;
    isMicrophoneEnabled: boolean;
  }) => {
    const tracks = useParticipantTracks(
      [Track.Source.Microphone, Track.Source.Camera],
      identity,
    );
    const videoTrack: Track | undefined = useMemo(
      () =>
        tracks?.filter(({ source }) => source === Track.Source.Camera)[0]
          ?.publication?.track,
      [tracks],
    );
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current && videoTrack) {
        videoTrack.attach(videoRef.current);
      }
      return () => {
        videoTrack?.detach();
      };
    }, [videoTrack]);

    return (
      <motion.div
        key={identity}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`${isCameraEnabled ? "w-fit h-fit bg-transparent" : "w-full h-full bg-background"} overflow-hidden m-auto max-w-full max-h-full relative`}
        layout
      >
        <video
          muted
          autoPlay
          playsInline
          className={`rounded-md -scale-x-100 w-full h-full max-w-full max-h-full object-scale-down ${!isCameraEnabled && "hidden"}`}
          ref={videoRef}
        />

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20">
          <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs flex items-center gap-2">
            {isMicrophoneEnabled ? (
              <Mic className="w-3" />
            ) : (
              <MicOff className="w-3" />
            )}
            <span>{userName}</span>
          </div>
        </div>

        {!isCameraEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative bg-gray-200 dark:bg-black/25 shadow flex justify-center items-center rounded-md overflow-hidden"
          >
            <div className="absolute w-full h-full overflow-visible top-0 left-0 z-10 origin-center animate-bg-effect">
              <div className="absolute bottom-20 left-20 bg-[#3291ff] w-1/4 h-1/4 dark:w-1/6 dark:h-1/6 blur-[150px] rounded-full"></div>
              <div className="absolute top-20 right-20 bg-[#79ffe1] w-1/4 h-1/4 dark:w-1/6 dark:h-1/6 blur-[150px] rounded-full"></div>
            </div>
            <Avatar
              className="bg-white/50 dark:bg-[rgba(26,_115,_232,_0.15)] shadow z-20 text-gray-600 dark:text-[rgb(26,_115,_232)]"
              ref={(element) => {
                if (element) {
                  const width = element.parentElement?.clientWidth || 1;
                  const height = element.parentElement?.clientHeight || 1;
                  const maxSize = Math.min(
                    Math.max(width, height) / 3.5,
                    height / 2,
                  );
                  element.style.width = `${maxSize}px`;
                  element.style.height = `${maxSize}px`;
                  element.style.fontSize = `${maxSize / 5}px`;
                }
              }}
            >
              <AvatarImage
                className="w-1/2 m-auto"
                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${userName}`}
              />
              <AvatarFallback className="bg-transparent">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        )}
      </motion.div>
    );
  },
);

Participant.displayName = "Participant";
export default Participant;
