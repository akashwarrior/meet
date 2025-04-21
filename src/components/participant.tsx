import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { MicOff, MoreHorizontal } from "lucide-react"
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

export function Participant({ participant, onMute, onRemove }: {
    participant: Participant
    onMute?: () => void
    onRemove?: () => void
}) {
    return (
        <div className="w-full h-full bg-gradient-to-br from-muted to-primary/15 flex items-center justify-center relative rounded-md">
            {participant.stream ? (
                <video autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
                <Avatar className="h-20 w-20 bg-white p-2.5">
                    <AvatarImage src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${participant.name!}`} />
                    <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
            )}


            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs flex items-center gap-1">
                    {!participant.isMuted && <MicOff className="h-3 w-3" />}
                    <span>{participant.name}</span>
                </div>
            </div>

            <div className="absolute top-2 right-2 flex space-x-1">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onMute}>
                            {participant.isMuted ? "Request Unmute" : "Mute"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onRemove}
                            className="text-red-500"
                        >
                            Remove from meeting
                        </DropdownMenuItem>
                    </DropdownMenuContent>

                </DropdownMenu>
            </div>
        </div >
    )
}