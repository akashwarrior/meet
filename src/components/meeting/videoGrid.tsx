"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Participant from "./participant";
import { useMediaQuery } from "usehooks-ts";
import { RoomAudioRenderer, useParticipants } from "@livekit/components-react";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

export default function VideoGrid() {
  const participants = useParticipants();
  const [currentPage, setCurrentPage] = useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const participantsPerPage = isSmallScreen ? 6 : 9;
  const totalPages = Math.ceil(participants.length / participantsPerPage);

  const start = currentPage * participantsPerPage;
  const end = start + participantsPerPage;

  const currentParticipants = participants.slice(start, end);

  const getGridClass = (): string => {
    switch (currentParticipants.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1";
      case 3:
        return "grid-cols-2 grid-rows-2";
      case 4:
        return "grid-cols-2 grid-rows-2";
      case 5:
      case 6:
        return "grid-cols-2 grid-rows-3 md:grid-cols-3 md:grid-rows-2";
      default:
        return "grid-cols-2 md:grid-cols-3 grid-rows-3";
    }
  };

  return (
    <div className="flex-1 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-accent/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(var(--primary),0.02)_50%,transparent_60%)] pointer-events-none" />

      <RoomAudioRenderer />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "h-full w-full p-4 grid gap-3 relative z-10",
          getGridClass()
        )}
      >
        {currentParticipants.map(
          ({ identity, name, isCameraEnabled, isMicrophoneEnabled, videoTrackPublications }) => (
            <Participant
              key={identity}
              identity={identity}
              userName={name || "Unknown"}
              isCameraEnabled={isCameraEnabled}
              isMicrophoneEnabled={isMicrophoneEnabled}
              videoTrackPublications={videoTrackPublications}
            />
          ),
        )}
      </motion.div>

      {totalPages > 1 && (
        <div className="absolute bottom-24 left-0 w-full flex justify-center items-center space-x-3 z-50">
          <Button
            size="icon"
            className="rounded-full bg-card/90 backdrop-blur-md border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg transition-all duration-200"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 0}
          >
            <LucideChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex space-x-2 bg-card/90 backdrop-blur-md rounded-full px-3 py-2 border border-border/50 shadow-lg">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  "h-2 w-2 rounded-full shadow border",
                  currentPage === index
                    ? "bg-primary shadow-md scale-125"
                    : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>

          <Button
            size="icon"
            className="rounded-full bg-card/90 backdrop-blur-md border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg transition-all duration-200"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages - 1}
          >
            <LucideChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
