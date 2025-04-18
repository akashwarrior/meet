"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Hand,
  Mic,
  MicOff,
  MoreHorizontal,
  Phone,
  PictureInPicture,
  RepeatIcon,
  Settings,
  Shield,
  Users,
  Video,
  VideoOff,
} from "lucide-react"
import { Meeting } from "@/components/pages/meeting"


export default function MeetingPage() {
  const params = useParams();
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showRecordingUnavailable, setShowRecordingUnavailable] = useState(false)
  const meetingContainerRef = useRef<HTMLDivElement>(null)

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (meetingContainerRef.current?.requestFullscreen) {
        meetingContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])


  return (
    <div ref={meetingContainerRef} className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Meeting header */}
      <div className="flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2 z-10">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <span className="font-medium">
            Meeting ID: <span className="font-mono">{params.id}</span>
          </span>
          {true ? (
            <Badge
              variant="outline"
              className="ml-2 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
            >
              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
              Connected
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="ml-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            >
              <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
              Connecting...
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1">
            <Users className="h-4 w-4" />
            <span>{"participants.length"}</span>
          </Button>

          {/* {showWaitingRoom && (
            <Button variant="outline" size="sm" className="gap-1 animate-pulse" onClick={admitFromWaitingRoom}>
              <Users className="h-4 w-4 text-primary" />
              <span>{waitingRoomCount} in waiting room</span>
            </Button>
          )} */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleFullscreen}>
                <PictureInPicture className="mr-2 h-4 w-4" />
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Badge
                  variant="outline"
                  className="mr-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                >
                  Coming Soon
                </Badge>
                <RepeatIcon className="mr-2 h-4 w-4" />
                Recording
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Meeting Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Meeting isVideoOn={isVideoOn} />

      {/* Meeting controls */}
      <div className="flex items-center justify-center bg-background/95 backdrop-blur border-t px-4 py-3 z-10 relative">
        {/* Security indicator */}
        <div className="absolute left-4 flex items-center gap-2 rounded-md bg-background/80 px-3 py-1.5 text-sm backdrop-blur-sm">
          <Shield className="h-4 w-4 text-primary" />
          <span>Encrypted</span>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMuted ? "secondary" : "outline"}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isVideoOn ? "outline" : "secondary"}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={() => setIsVideoOn(prev => !prev)}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isVideoOn ? "Stop" : "Start"}  Video</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                  <Hand className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Raise Hand</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 relative"
                  onClick={() => setShowRecordingUnavailable(true)}
                >
                  <RepeatIcon className="h-5 w-5" />
                  <Badge
                    variant="outline"
                    className="absolute -top-2 -right-2 text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                  >
                    Soon
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recording (Coming Soon)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="destructive"
            size="lg"
            className="rounded-full h-12 px-6"
            onClick={() => setShowLeaveDialog(true)}
          >
            <Phone className="h-5 w-5 rotate-135" />
            <span className="ml-2 hidden sm:inline">Leave</span>
          </Button>
        </div>
      </div>

      {/* Leave meeting dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Meeting</DialogTitle>
            <DialogDescription>Are you sure you want to leave this meeting?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => router.push("/dashboard")}>
              Leave Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recording unavailable dialog */}
      <Dialog open={showRecordingUnavailable} onOpenChange={setShowRecordingUnavailable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recording Coming Soon</DialogTitle>
            <DialogDescription>
              Meeting recording functionality is currently in development and will be available in a future update.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Our team is working hard to bring you high-quality meeting recording capabilities. Stay tuned for updates!
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRecordingUnavailable(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}