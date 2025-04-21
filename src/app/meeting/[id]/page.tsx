"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LucideMic,
  LucideMicOff,
  LucideVideo,
  LucideVideoOff,
  LucideMonitor,
  LucideMessageSquare,
  LucideUsers,
  LucideMoreVertical,
  LucidePhone,
  LucideInfo,
  LucideX,
  LucideSend,
  LucideMaximize,
  LucideUserPlus,
  LucideCopy,
  LucideShield,
  LucideMoreHorizontal,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
import { Participant } from "@/components/participant"
import { SelectLabel } from "@radix-ui/react-select"
import { LiveClock } from "@/components/liveClock"

// Participant type definition
interface Participant {
  id: string
  name: string
  isMuted: boolean
  isVideoOff: boolean
  stream?: MediaStream | null
  isScreenSharing?: boolean
}

// Message type definition
interface Message {
  id: string
  sender: string
  content: string
  time: string
  isSystem?: boolean
}

interface WaitingParticipant {
  id: string
  name: string
  joinTime: string
}

// Mock data for demonstration
const mockParticipants = [
  {
    id: "1",
    name: "Alice Johnson",
    isMuted: false,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "2",
    name: "Bob Smith",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "3",
    name: "Charlie Brown",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "4",
    name: "Diana Prince",
    isMuted: false,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "5",
    name: "Ethan Hunt",
    isMuted: true,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "6",
    name: "Felicity Smoak",
    isMuted: true,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "7",
    name: "Gordon Freeman",
    isMuted: false,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "8",
    name: "Hannah Montana",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "9",
    name: "Ivy League",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "10",
    name: "Jack Sparrow",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "11",
    name: "Katherine Johnson",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "12",
    name: "Leonardo DiCaprio",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "13",
    name: "Mia Wallace",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "14",
    name: "Nathan Drake",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "15",
    name: "Olivia Pope",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "16",
    name: "Peter Parker",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "17",
    name: "Quinn Fabray",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "18",
    name: "Rick Grimes",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "19",
    name: "Steve Rogers",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "20",
    name: "Tony Stark",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
]

export default function MeetingRoom() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userName = searchParams.get("name") || "You"

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("participants")
  const [message, setMessage] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  // Meeting state
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants)
  const [messages, setMessages] = useState<Message[]>([])
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  // Device settings
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("mic")
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("camera")

  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([])
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const participantsPerPage = false ? 6 : 9
  const totalPages = Math.ceil((participants.length + 1) / participantsPerPage)


  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Add system message
  const addSystemMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "System",
      content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSystem: true,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  // Send a chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: userName,
        content: message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, newMessage])
      setMessage("")

      // Simulate receiving a response after a delay
      setTimeout(() => {
        const randomParticipant = participants[Math.floor(Math.random() * participants.length)]
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: randomParticipant.name,
          content: `Thanks for your message, ${userName}!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, responseMessage])
      }, 2000)
    }
  }

  // Toggle sidebar
  const toggleSidebar = (tab: string) => {
    if (sidebarOpen && activeTab === tab) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
      setActiveTab(tab)
    }
  }

  // Copy meeting link
  const copyMeetingLink = () => {
    // const link = `${window.location.origin}/meeting/${id}?name=Guest`
    // navigator.clipboard.writeText(link)
    toast.success("Meeting link copied", {
      description: "Share this link with others to invite them",
      duration: 2000,
    })
  }

  // Remove a participant from the meeting
  const removeParticipant = (participantId: string) => {
    // Get participant name before removing
    const participant = participants.find((p) => p.id === participantId)
    const participantName = participant ? participant.name : "Participant"

    setParticipants((prev) => prev.filter((p) => p.id !== participantId))

    // Add system message
    addSystemMessage(`${participantName} was removed from the meeting by ${userName}`)

    toast.success("Participant removed", {
      description: `${participantName} has been removed from the meeting`,
      duration: 2000,
    })
  }

  // Add participant admission functions
  const admitParticipant = (participantId: string) => {
    const waitingParticipant = waitingParticipants.find((p) => p.id === participantId)
    if (waitingParticipant) {
      // Add to participants
      const newParticipant: Participant = {
        id: waitingParticipant.id,
        name: waitingParticipant.name,
        isMuted: false,
        isVideoOff: false,
        stream: null,
      }

      setParticipants((prev) => [...prev, newParticipant])

      // Remove from waiting room
      setWaitingParticipants((prev) => prev.filter((p) => p.id !== participantId))

      // Add system message
      addSystemMessage(`${waitingParticipant.name} joined the meeting`)

      toast.success("Participant admitted", {
        description: `${waitingParticipant.name} has been admitted to the meeting`,
        duration: 2000,
      })
    }
  }

  const rejectParticipant = (participantId: string) => {
    const waitingParticipant = waitingParticipants.find((p) => p.id === participantId)
    if (waitingParticipant) {
      // Remove from waiting room
      setWaitingParticipants((prev) => prev.filter((p) => p.id !== participantId))

      // Add system message
      addSystemMessage(`${waitingParticipant.name}'s request to join was declined`)

      toast.success("Participant rejected", {
        description: `${waitingParticipant.name} has been denied access to the meeting`,
        duration: 2000,
      })
    }
  }

  // Pagination controls
  const nextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    setCurrentPage(currentPage - 1)
  }

  const getGridClass = () => {
    const pageParticipants = getCurrentPageParticipants()
    const count = pageParticipants.length

    if (false) {
      if (count === 1) return "grid-cols-1"
      if (count === 2) return "grid-cols-1 grid-rows-2"
      if (count === 3) return "grid-cols-2 grid-rows-2 [&>*:nth-child(3)]:col-span-2"
      if (count === 4) return "grid-cols-2 grid-rows-2"
      return "grid-cols-2 grid-rows-3"
    } else {
      if (count === 1) return "grid-cols-1"
      if (count === 2) return "grid-cols-2"
      if (count === 3) return "grid-cols-2 grid-rows-2"
      if (count === 4) return "grid-cols-2 grid-rows-2"
      if (count <= 6) return "grid-col-2 grid-cols-3 grid-rows-2"
      return "grid-cols-3 grid-rows-3"
    }
  }

  // Get participants for current page
  const getCurrentPageParticipants = () => {
    const start = currentPage * participantsPerPage
    const end = start + participantsPerPage

    return participants.slice(start, end)
  }

  // Leave the meeting
  const leaveCall = () => {
    router.push("/")
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <svg viewBox="0 0 87 30" className="h-5 w-auto text-foreground" fill="currentColor">
            <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
          </svg>
          <span className="ml-2 text-lg font-medium text-foreground">Meet</span>
        </div>
        <div className="flex items-center">
          <div className="text-muted-foreground mr-4 hidden sm:block">
            <span className="font-medium">Meeting ID:</span> {id}
          </div>

          <ThemeToggle />

          {waitingParticipants.length > 0 && (
            <Button variant="outline" size="sm" className="relative ml-2" onClick={() => setShowWaitingRoom(true)}>
              <LucideUsers className="h-4 w-4 mr-1" />
              Waiting
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {waitingParticipants.length}
              </span>
            </Button>
          )}

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <LucideUserPlus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite people</DialogTitle>
                <DialogDescription>Share this meeting link with others you want to invite</DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-4">
                {/* <Input value={`${window.location.origin}/meeting/${id}?name=Guest`} readOnly className="flex-1" /> */}
                <Button onClick={copyMeetingLink} size="icon">
                  <LucideCopy className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Security options</h4>
                <div className="flex items-center space-x-2">
                  <LucideShield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Only people who receive the link can join</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <LucideInfo className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm font-medium">Meeting details</div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="text-xs text-muted-foreground">Meeting ID</div>
                <div className="text-sm">{id}</div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs text-muted-foreground">Joining info</div>
                {/* <div className="text-sm">{`${window.location.origin}/meeting/${id}?name=Guest`}</div> */}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyMeetingLink}>
                <LucideCopy className="h-4 w-4 mr-2" />
                Copy joining info
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 flex flex-grow overflow-hidden">
        {/* Video grid layout */}
        <div className={cn("h-full w-full p-2 grid gap-2", getGridClass())}>
          {getCurrentPageParticipants().slice(0, 9).map(
            (participant) =>
              <Participant
                key={participant.id}
                participant={participant}
                onRemove={() => removeParticipant(participant.id)}
              />
          )}
        </div>

        {totalPages > 1 && (
          <div className="absolute bottom-20 left-0 w-full flex justify-center items-center space-x-2">
            <Button
              size="icon"
              className="rounded-full bg-primary text-white"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <LucideChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <div
                  key={index}
                  className={cn("h-2 w-2 rounded-full shadow border", currentPage === index ? "bg-primary" : "bg-gray-400")}
                />
              ))}
            </div>

            <Button
              size="icon"
              className="rounded-full bg-primary text-white"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              <LucideChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Sidebar */}
        <div className={cn("bg-background overflow-hidden border max-w-full w-sm flex flex-col transition-all duration-300 rounded-lg",
          sidebarOpen ? "translate-x-0" : "translate-x-full w-0",
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <TabsList className="w-full">
                <TabsTrigger value="participants" className="flex-1">
                  <LucideUsers className="h-4 w-4 mr-2" />
                  People ({participants.length + 1})
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex-1">
                  <LucideMessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <LucideX className="h-4 w-4" />
              </Button>
            </div>

            <TabsContent value="participants" className="flex-1 p-0 m-0 overflow-hidden">
              <h3 className="text-sm font-medium text-muted-foreground my-2 mx-4">Participants</h3>
              <ScrollArea className="h-full px-6">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-500">{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-muted-foreground gap-4">
                        {participant.isMuted ? (
                          <LucideMicOff size="18" />
                        ) : (
                          <LucideMic size="18" />
                        )}
                        {participant.isVideoOff ? (
                          <LucideVideoOff size="18" />
                        ) : (
                          <LucideVideo size="18" />
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <LucideMoreHorizontal size="6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            {participant.isMuted ? "Unmute" : "Mute"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => removeParticipant(participant.id)}
                            className="text-red-500"
                          >
                            <LucideLogOut className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col">
                      <div className="flex items-center mb-1">
                        <span className={cn("font-medium mr-2", msg.isSystem && "text-blue-500 dark:text-blue-400")}>
                          {msg.sender}
                        </span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className={cn("text-foreground", msg.isSystem && "text-muted-foreground italic")}>
                        {msg.content}
                      </p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex items-center">
                <Input
                  type="text"
                  placeholder="Send a message to everyone"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 mr-2"
                />
                <Button type="submit" size="icon" variant="ghost">
                  <LucideSend className="h-5 w-5" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main >

      <footer className="bg-background border-t border-border py-3 px-4 md:py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground hidden md:block">
            <LiveClock />
            {/* {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} */}
          </div>
          <div className="flex items-center space-x-1 md:space-x-2 mx-auto md:mx-0">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-10 w-10 md:h-12 md:w-12"
            >
              {isMuted ? <LucideMicOff className="h-5 w-5" /> : <LucideMic className="h-5 w-5" />}
            </Button>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-10 w-10 md:h-12 md:w-12"
            >
              {isVideoOff ? <LucideVideoOff className="h-5 w-5" /> : <LucideVideo className="h-5 w-5" />}
            </Button>
            <Button
              variant={isScreenSharing ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-10 w-10 md:h-12 md:w-12"
            >
              <LucideMonitor className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12">
                  <LucideMoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  {isRecording ? "Stop recording" : "Start recording"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => document.documentElement.requestFullscreen()}>
                  <LucideMaximize className="h-4 w-4 mr-2" />
                  Full screen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => toggleSidebar("chat")}
              variant="secondary"
              size="icon"
              className={cn(
                "rounded-full h-10 w-10 md:h-12 md:w-12",
                activeTab === "chat" && sidebarOpen && "bg-blue-100 dark:bg-blue-900",
              )}
            >
              <LucideMessageSquare className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => toggleSidebar("participants")}
              variant="secondary"
              size="icon"
              className={cn(
                "rounded-full h-10 w-10 md:h-12 md:w-12",
                activeTab === "participants" && sidebarOpen && "bg-blue-100 dark:bg-blue-900",
              )}
            >
              <LucideUsers className="h-5 w-5" />
            </Button>

            <Button onClick={leaveCall} variant="destructive" className="rounded-full h-10 px-4 md:h-12 md:px-6">
              <LucidePhone className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Leave</span>
            </Button>
          </div>
          <div className="w-24 hidden md:block"></div> {/* Spacer for centering */}
        </div>
      </footer>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Audio</h3>
              <div className="space-y-2">
                <Label htmlFor="microphone">Microphone</Label>
                <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                  <SelectTrigger id="microphone">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectLabel>Microphones</SelectLabel>
                    {audioDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">Mute/Unmute</span>
                <Button variant="outline" size="sm">
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Video</h3>
              <div className="space-y-2">
                <Label htmlFor="camera">Camera</Label>
                <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                  <SelectTrigger id="camera">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectLabel>Cameras</SelectLabel>
                    {videoDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">Camera</span>
                <Button variant="outline" size="sm">
                  {isVideoOff ? "Turn on" : "Turn off"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Layout</h3>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waiting Room Dialog */}
      <Dialog open={showWaitingRoom} onOpenChange={setShowWaitingRoom}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Waiting Room</DialogTitle>
            <DialogDescription>These participants are waiting to join the meeting</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {waitingParticipants.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No one is waiting to join</p>
            ) : (
              <div className="space-y-3">
                {waitingParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-yellow-500">{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-xs text-muted-foreground">Waiting since {participant.joinTime}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectParticipant(participant.id)}
                        className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        Deny
                      </Button>
                      <Button variant="default" size="sm" onClick={() => admitParticipant(participant.id)}>
                        Admit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}