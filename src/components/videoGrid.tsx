'use client'

import { cn } from "@/lib/utils"
import { memo, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { LucideChevronLeft, LucideChevronRight } from "lucide-react"
import { LazyMotion } from "motion/react"
import * as motion from "motion/react-m"
import Participant from "./participant"
import useParticipantStore from "@/store/participant"

const loadFeatures = () => import("@/components/domAnimation").then(res => res.default)

const VideoGrid = memo(() => {
    const [currentPage, setCurrentPage] = useState(0)
    const participants = useParticipantStore((state) => state.participants)
    const mobile = useMobile();

    const participantsPerPage = mobile ? 6 : 9
    const totalPages = participants.length / participantsPerPage

    const currentParticipants = useMemo(() => {
        const start = currentPage * participantsPerPage
        const end = start + participantsPerPage

        return participants.slice(start, end)
    }, [participants, currentPage, participantsPerPage]);


    const getGridClass = useMemo(() => {
        switch (currentParticipants.length) {
            case 1:
                return "grid-cols-1"
            case 2:
                return "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1"
            case 3:
                return "grid-cols-2 grid-rows-2"
            case 4:
                return "grid-cols-2 grid-rows-2"
            case 5:
            case 6:
                return "grid-cols-2 grid-rows-3 md:grid-cols-3 md:grid-rows-2"
            default:
                return "grid-cols-2 md:grid-cols-3 grid-rows-3"
        }
    }, [currentParticipants.length])


    return (
        <LazyMotion features={loadFeatures}>
            <div className="flex-1 flex flex-grow overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className={cn("h-full w-full p-2 grid gap-2 ", getGridClass)}
                    layout
                >
                    {currentParticipants.map(
                        ({ sid, name }) =>
                            <Participant
                                key={sid}
                                participant={{
                                    id: sid,
                                    name: name || "Unknown",
                                }}
                            />
                    )}
                </motion.div>

                {totalPages > 1 && (
                    <div className="absolute bottom-20 left-0 w-full flex justify-center items-center space-x-2 z-50">
                        <Button
                            size="icon"
                            className="rounded-full bg-primary text-white"
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            disabled={currentPage === 0}
                        >
                            <LucideChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex space-x-1">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <motion.div
                                    key={index}
                                    className={cn("h-2 w-2 rounded-full shadow border", currentPage === index ? "bg-primary" : "bg-gray-400")}
                                />
                            ))}
                        </div>

                        <Button
                            size="icon"
                            className="rounded-full bg-primary text-white"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={currentPage === totalPages - 1}
                        >
                            <LucideChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </LazyMotion>
    )
});

VideoGrid.displayName = "VideoGrid"
export default VideoGrid