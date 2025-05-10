'use client';

import { toast } from "sonner";
import { memo, useState } from "react";
import { Button } from "./ui/button";
import { Info, UserPlus, Copy, Shield } from "lucide-react"
import { Input } from "./ui/input";
import ThemeToggle from "./theme-toggle"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { RoomAudioRenderer } from "@livekit/components-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"

const MeetingHeader = memo(({ meetingId }: { meetingId: string }) => {
    const [showInviteDialog, setShowInviteDialog] = useState(false)

    const copyMeetingLink = () => {
        const link = window.location.href
        navigator.clipboard.writeText(link)
        toast.success("Meeting link copied", {
            description: "Share this link with others to invite them",
            duration: 2000,
        })
    }

    return (
        <header className="border-b border-border px-4 py-2 flex items-center justify-between">
            <RoomAudioRenderer />
            <div className="flex items-center">
                <svg viewBox="0 0 87 30" className="h-5 w-auto text-foreground" fill="currentColor">
                    <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
                </svg>
                <span className="ml-2 text-lg font-medium text-foreground">Meet</span>
            </div>
            <div className="flex items-center">
                <ThemeToggle />
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-foreground">
                            <UserPlus className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite people</DialogTitle>
                            <DialogDescription>Share this meeting link with others you want to invite</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2 mt-4">
                            <Input
                                value={window.location.href}
                                className="flex-1 focus-visible:ring-0"
                                readOnly
                            />
                            <Button onClick={copyMeetingLink} size="icon">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Security options</h4>
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Only people who receive the link can join</span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-foreground">
                            <Info className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-sm font-medium">Meeting details</div>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                            <div className="text-xs text-muted-foreground">Meeting ID</div>
                            <div className="text-sm">{meetingId}</div>
                        </div>
                        <div className="px-2 py-1.5">
                            <div className="text-xs text-muted-foreground">Joining info</div>
                            <div className="text-sm">{window.location.href}</div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={copyMeetingLink}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy joining info
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
});

MeetingHeader.displayName = "MeetingHeader";
export default MeetingHeader;