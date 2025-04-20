import { cn } from "@/lib/utils"
import { useState } from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { LucideMicOff, LucideMoreHorizontal, LucidePin, LucidePinOff } from "lucide-react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"


interface Participant {
    id: string
    name: string
    isMuted: boolean
    isVideoOff: boolean
    stream?: MediaStream | null
    isScreenSharing?: boolean
}

// Participant Video Component
export function Participant({
    participant,
    isPinned = false,
    onPin,
    onMute,
    onRemove,
}: {
    participant: Participant
    isPinned?: boolean
    onPin?: () => void
    onMute?: () => void
    onRemove?: () => void
}) {
    const [showControls, setShowControls] = useState(false)

    return (
        <div
            className={cn(
                "relative bg-black rounded-lg overflow-hidden shadow-md group",
                isPinned ? "col-span-full row-span-1 md:row-span-1" : "",
            )}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {participant.stream && !participant.isVideoOff ? (
                <video autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl md:text-3xl bg-gray-200">{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            )}

            <div className="absolute bottom-1 left-1 text-gray-700 px-2 py-1 text-sm flex items-center">
                {participant.name}
                {participant.isMuted && <LucideMicOff className="h-3 w-3 ml-1" />}
            </div>

            {(showControls || isPinned) && (
                <div className="absolute top-2 right-2 flex space-x-1">
                    {onPin && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPin}
                            className="h-8 w-8 bg-black bg-opacity-60 text-white hover:bg-opacity-70"
                        >
                            {isPinned ? <LucidePinOff className="h-4 w-4" /> : <LucidePin className="h-4 w-4" />}
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-black bg-opacity-60 text-white hover:bg-opacity-70"
                            >
                                <LucideMoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onMute && (
                                <DropdownMenuItem onClick={onMute}>{participant.isMuted ? "Unmute" : "Mute"}</DropdownMenuItem>
                            )}
                            {onPin && <DropdownMenuItem onClick={onPin}>{isPinned ? "Unpin" : "Pin"}</DropdownMenuItem>}
                            {onRemove && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onRemove} className="text-red-500">
                                        Remove from meeting
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    )
}