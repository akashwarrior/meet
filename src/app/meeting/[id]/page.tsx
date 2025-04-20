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
  LucidePresentation,
  LucideLayout,
  LucideMaximize,
  LucideUserPlus,
  LucideCopy,
  LucideShield,
  LucidePin,
  LucidePinOff,
  LucideMoreHorizontal,
  LucideLogOut,
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
import { useMobile } from "@/hooks/use-mobile"
import { Participant } from "@/components/participant"

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
const mockParticipants: Participant[] = [
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
    name: "Charlie Davis",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "4",
    name: "Diana Miller",
    isMuted: true,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "5",
    name: "Ethan Brown",
    isMuted: false,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "6",
    name: "Fiona Wilson",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "7",
    name: "George Taylor",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "8",
    name: "Hannah Anderson",
    isMuted: true,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "9",
    name: "Ian Thomas",
    isMuted: false,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "10",
    name: "Julia Martinez",
    isMuted: true,
    isVideoOff: false,
    stream: null,
  },
  {
    id: "11",
    name: "Kevin Garcia",
    isMuted: false,
    isVideoOff: true,
    stream: null,
  },
  {
    id: "12",
    name: "Laura Rodriguez",
    isMuted: true,
    isVideoOff: true,
    stream: null,
  }
]

// Initial messages
const initialMessages: Message[] = [
  {
    id: "1",
    sender: "System",
    content: "Welcome to the meeting! Remember to keep your microphone muted when not speaking.",
    time: "10:00 AM",
    isSystem: true,
  },
]

export default function MeetingRoom() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userName = searchParams.get("name") || localStorage?.getItem("userName") || "You"
  const isMobile = useMobile()

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("participants")
  const [message, setMessage] = useState("")
  const [layout, setLayout] = useState("grid") // grid, spotlight, sidebar
  const [showSettings, setShowSettings] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  // Meeting state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isMuted, setIsMuted] = useState(localStorage?.getItem("isMicOn") === "false")
  const [isVideoOff, setIsVideoOff] = useState(localStorage?.getItem("isCameraOn") === "false")
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null)

  // Device settings
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("")
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("")

  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([])
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        // Get available media devices
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter((device) => device.kind === "audioinput")
        const videoInputs = devices.filter((device) => device.kind === "videoinput")

        setAudioDevices(audioInputs)
        setVideoDevices(videoInputs)

        // Set default devices
        if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId)
        if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId)

        // Get media stream
        // const stream = await navigator.mediaDevices.getUserMedia({
        //   video: true,
        //   audio: true,
        // })

        const stream = new MediaStream();
        // Apply saved settings
        const audioTracks = stream.getAudioTracks()
        audioTracks.forEach((track) => {
          track.enabled = !isMuted
        })

        const videoTracks = stream.getVideoTracks()
        videoTracks.forEach((track) => {
          track.enabled = !isVideoOff
        })

        setLocalStream(stream)

        // Set video element source
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Add system message about joining
        addSystemMessage(`${userName} joined the meeting`)
      } catch (error) {
        console.error("Error accessing media devices:", error)
        toast.error("Media Error", {
          description: "Could not access camera or microphone. Please check your device permissions.",
        })
        setIsVideoOff(true)
        setIsMuted(true)
      }
    }

    initializeMedia()

    // Cleanup function
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop()
        })
      }

      // Remove any screen share overlay if it exists
      const overlay = document.getElementById("screen-share-overlay")
      if (overlay) {
        overlay.remove()
      }
    }
  }, [])

  // Update stream when device selections change
  useEffect(() => {
    const updateMediaStream = async () => {
      if (!selectedAudioDevice && !selectedVideoDevice) return

      try {
        // Stop existing tracks
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop())
        }

        // Get new stream with selected devices
        const constraints: MediaStreamConstraints = {
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
          video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        }

        // const newStream = await navigator.mediaDevices.getUserMedia(constraints)

        const newStream = new MediaStream();

        // Apply current settings to new stream
        const audioTracks = newStream.getAudioTracks()
        audioTracks.forEach((track) => {
          track.enabled = !isMuted
        })

        const videoTracks = newStream.getVideoTracks()
        videoTracks.forEach((track) => {
          track.enabled = !isVideoOff
        })

        setLocalStream(newStream)

        // Update video element
        if (videoRef.current) {
          videoRef.current.srcObject = newStream
        }
      } catch (error) {
        console.error("Error updating media devices:", error)
        toast.error("Device Error", {
          description: "Could not access selected devices. Please try different ones.",
        })
      }
    }

    updateMediaStream()
  }, [selectedAudioDevice, selectedVideoDevice])

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [sidebarOpen])

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

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)

      // Update localStorage
      localStorage?.setItem("isMicOn", isMuted.toString())

      // Add system message
      addSystemMessage(`${userName} ${isMuted ? "unmuted" : "muted"} their microphone`)

      toast.info(isMuted ? "Microphone unmuted" : "Microphone muted", {
        duration: 2000,
      })
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff
      })
      setIsVideoOff(!isVideoOff)

      // Update localStorage
      localStorage?.setItem("isCameraOn", isVideoOff.toString())

      // Add system message
      addSystemMessage(`${userName} turned ${isVideoOff ? "on" : "off"} their camera`)

      toast.info(isVideoOff ? "Camera turned on" : "Camera turned off", {
        duration: 2000,
      })
    }
  }

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      setIsScreenSharing(false)

      // Remove any screen share overlay if it exists
      const overlay = document.getElementById("screen-share-overlay")
      if (overlay) {
        overlay.remove()
      }

      // Revert to camera
      try {
        if (localStream) {
          // Stop all current tracks
          localStream.getTracks().forEach((track) => track.stop())
        }

        // Get camera stream again
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
        })

        // Apply current settings
        const audioTracks = newStream.getAudioTracks()
        audioTracks.forEach((track) => {
          track.enabled = !isMuted
        })

        const videoTracks = newStream.getVideoTracks()
        videoTracks.forEach((track) => {
          track.enabled = !isVideoOff
        })

        setLocalStream(newStream)

        // Update video element
        if (videoRef.current) {
          videoRef.current.srcObject = newStream
        }

        // Add system message
        addSystemMessage(`${userName} stopped sharing their screen`)
      } catch (error) {
        console.error("Error reverting to camera:", error)
        toast.error("Error", {
          description: "Could not revert to camera",
        })
      }

      toast.info("Screen sharing stopped", {
        duration: 2000,
      })
    } else {
      try {
        // Try to get screen sharing - this might fail in preview mode
        let screenStream: MediaStream | null = null

        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          })
        } catch (error) {
          // This is expected to fail in preview mode or iframes
          console.log("Screen sharing not available in this environment, using simulation mode")
          // We'll continue with the simulation approach
        }

        if (screenStream) {
          // Real screen sharing is available
          // If we have an existing stream, we need to replace the video track
          if (localStream) {
            // Keep audio tracks from the original stream
            const audioTracks = localStream.getAudioTracks()

            // Create a new stream with screen video and original audio
            const newStream = new MediaStream()

            screenStream.getVideoTracks().forEach((track) => {
              newStream.addTrack(track)

              // Listen for the end of screen sharing
              track.onended = async () => {
                await toggleScreenShare()
              }
            })

            audioTracks.forEach((track) => {
              newStream.addTrack(track)
            })

            // Stop old tracks
            localStream.getVideoTracks().forEach((track) => track.stop())

            setLocalStream(newStream)

            // Update video element
            if (videoRef.current) {
              videoRef.current.srcObject = newStream
            }
          } else {
            setLocalStream(screenStream)
          }

          setIsScreenSharing(true)

          // Add system message
          addSystemMessage(`${userName} started sharing their screen`)

          toast.info("Screen sharing started", {
            description: "Your screen is now visible to all participants",
            duration: 2000,
          })
        } else {
          // Simulation mode - no real screen sharing
          setIsScreenSharing(true)

          // If we have a video element, we'll modify its appearance to simulate screen sharing
          if (videoRef.current && !isVideoOff) {
            // We'll add a visual indicator that this is simulated screen sharing
            // by adding a semi-transparent overlay with text
            const videoContainer = videoRef.current.parentElement
            if (videoContainer) {
              const overlay = document.createElement("div")
              overlay.className = "absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-10"
              overlay.id = "screen-share-overlay"

              const text = document.createElement("div")
              text.className = "bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm"
              text.textContent = "Screen sharing (simulated)"

              overlay.appendChild(text)
              videoContainer.appendChild(overlay)
            }
          }

          // Add system message
          addSystemMessage(`${userName} started sharing their screen (simulated)`)

          toast.info("Screen sharing simulated", {
            description: "Real screen sharing is not available in preview mode. This is a simulation.",
            duration: 3000,
          })
        }
      } catch (error) {
        // This should rarely happen now since we're catching errors earlier
        console.error("Unexpected error in screen sharing:", error)

        // Fall back to simulation mode
        setIsScreenSharing(true)

        // Add visual indicator for simulation
        if (videoRef.current && !isVideoOff) {
          const videoContainer = videoRef.current.parentElement
          if (videoContainer) {
            const overlay = document.createElement("div")
            overlay.className = "absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-10"
            overlay.id = "screen-share-overlay"

            const text = document.createElement("div")
            text.className = "bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm"
            text.textContent = "Screen sharing (simulated)"

            overlay.appendChild(text)
            videoContainer.appendChild(overlay)
          }
        }

        // Add system message
        addSystemMessage(`${userName} started sharing their screen (simulated)`)

        toast.info("Screen sharing simulated", {
          description: "Real screen sharing is not available. This is a simulation.",
          duration: 3000,
        })
      }
    }
  }

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording)

    // Add system message
    addSystemMessage(`${userName} ${isRecording ? "stopped" : "started"} recording the meeting`)

    toast.info(isRecording ? "Recording stopped" : "Recording started", {
      duration: 2000,
    })
  }

  // Pin/unpin participant
  const togglePinParticipant = (participantId: string) => {
    if (pinnedParticipant === participantId) {
      setPinnedParticipant(null)
      toast.info("Participant unpinned", {
        duration: 2000,
      })
    } else {
      setPinnedParticipant(participantId)

      // Get participant name
      let name = "You"
      if (participantId !== "local") {
        const participant = participants.find((p) => p.id === participantId)
        if (participant) name = participant.name
      }

      toast.info(`${name} pinned`, {
        description: "This participant will be shown prominently",
        duration: 2000,
      })
    }
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
    const link = `${window.location.origin}/meeting/${id}?name=Guest`
    navigator.clipboard.writeText(link)
    toast.success("Meeting link copied", {
      description: "Share this link with others to invite them",
      duration: 2000,
    })
  }

  // Mute/unmute a participant (in a real app, this would be implemented with WebRTC)
  const toggleParticipantMute = (participantId: string) => {
    setParticipants((prev) => prev.map((p) => (p.id === participantId ? { ...p, isMuted: !p.isMuted } : p)))

    // Get participant name
    const participant = participants.find((p) => p.id === participantId)
    if (participant) {
      addSystemMessage(`${participant.name} was ${participant.isMuted ? "unmuted" : "muted"} by ${userName}`)

      toast.info(`${participant.name} ${participant.isMuted ? "unmuted" : "muted"}`, {
        duration: 2000,
      })
    }
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

  // Leave the meeting
  const leaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop()
      })
    }

    router.push("/")
  }

  // Calculate grid layout based on number of participants and pinned state
  const getGridClass = () => {
    const totalParticipants = participants.length + 1 // +1 for local user

    if (layout === "spotlight" || pinnedParticipant) {
      return "grid-cols-1"
    }

    if (totalParticipants <= 1) return "grid-cols-1"
    if (totalParticipants <= 2) return "grid-cols-1 md:grid-cols-2"
    if (totalParticipants <= 4) return "grid-cols-1 md:grid-cols-2"
    if (totalParticipants <= 9) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  }

  // Simulate a join request (for demonstration)
  const simulateJoinRequest = () => {
    const names = ["Michael Johnson", "Emma Williams", "James Brown", "Olivia Jones", "William Davis"]
    const randomName = names[Math.floor(Math.random() * names.length)]

    const newWaitingParticipant: WaitingParticipant = {
      id: `waiting-${Date.now()}`,
      name: randomName,
      joinTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setWaitingParticipants((prev) => [...prev, newWaitingParticipant])

    // Show notification
    toast.info("Join request", {
      description: `${randomName} is requesting to join the meeting`,
      duration: 4000,
    })

    // If waiting room isn't open, show the badge
    if (!showWaitingRoom) {
      // We'll add a visual indicator in the UI
    }
  }

  // Simulate occasional join requests (for demonstration)
  useEffect(() => {
    // Only add this in a real implementation if you want to demo the feature
    const interval = setInterval(() => {
      // 10% chance of a join request every 30 seconds
      if (Math.random() < 0.1) {
        simulateJoinRequest()
      }
    }, 30000)

    // Simulate one join request after 5 seconds
    const timeout = setTimeout(() => {
      simulateJoinRequest()
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

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
                <Input value={`${window.location.origin}/meeting/${id}?name=Guest`} readOnly className="flex-1" />
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
                <div className="text-sm">{`${window.location.origin}/meeting/${id}?name=Guest`}</div>
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

      <main className="flex-1 flex overflow-hidden">
        <div className={"flex-1 p-2 md:p-4"}>
          {/* Video grid layout */}
          <div className={cn("grid gap-2 md:gap-4 h-full", getGridClass(), pinnedParticipant && "grid-rows-[3fr_1fr]")}>
            {/* If there's a pinned participant, show them first */}
            {pinnedParticipant && (
              <div className="col-span-full row-span-1 md:row-span-1 relative bg-black rounded-lg overflow-hidden shadow-md">
                {pinnedParticipant === "local" ? (
                  // Local user is pinned
                  <>
                    {!isVideoOff ? (
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 dark:bg-gray-900">
                        <Avatar className="h-24 w-24">
                          <AvatarFallback className="text-3xl bg-blue-500">{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                      {userName} {isMuted && "(Muted)"}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePinParticipant("local")}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white hover:bg-opacity-70"
                    >
                      <LucidePinOff className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  // A participant is pinned
                  <Participant
                    participant={participants.find((p) => p.id === pinnedParticipant)!}
                    isPinned={true}
                    onPin={() => togglePinParticipant(pinnedParticipant)}
                    onMute={() => toggleParticipantMute(pinnedParticipant)}
                    onRemove={() => removeParticipant(pinnedParticipant)}
                  />
                )}
              </div>
            )}

            {/* Local video (if not pinned or in grid view) */}
            {(!pinnedParticipant || pinnedParticipant !== "local") && (
              <div className="relative bg-black rounded-lg overflow-hidden shadow-md">
                {!isVideoOff ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 dark:bg-gray-900">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl md:text-3xl bg-blue-500">{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                  {userName} {isMuted && "(Muted)"}
                </div>
              </div>
            )}

            {/* Remote participants (if not pinned or in grid view) */}
            {participants.map(
              (participant) =>
                (!pinnedParticipant || pinnedParticipant !== participant.id) && (
                  <Participant
                    key={participant.id}
                    participant={participant}
                    isPinned={false}
                    onPin={() => togglePinParticipant(participant.id)}
                    onMute={() => toggleParticipantMute(participant.id)}
                    onRemove={() => removeParticipant(participant.id)}
                  />
                ),
            )}
          </div>
        </div>

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
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="bg-blue-500">{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{userName}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    {isMuted ? <LucideMicOff size="18" /> : <LucideMic size="18" />}
                    {isVideoOff ? <LucideVideoOff size="18" /> : <LucideVideo size="18" />}
                  </div>
                </div>

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
                          <DropdownMenuItem onClick={() => toggleParticipantMute(participant.id)}>
                            {participant.isMuted ? "Unmute" : "Mute"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePinParticipant(participant.id)}>
                            {pinnedParticipant === participant.id ? "Unpin" : "Pin"}
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
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="flex items-center space-x-1 md:space-x-2 mx-auto md:mx-0">
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-10 w-10 md:h-12 md:w-12"
            >
              {isMuted ? <LucideMicOff className="h-5 w-5" /> : <LucideMic className="h-5 w-5" />}
            </Button>
            <Button
              onClick={toggleVideo}
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-10 w-10 md:h-12 md:w-12"
            >
              {isVideoOff ? <LucideVideoOff className="h-5 w-5" /> : <LucideVideo className="h-5 w-5" />}
            </Button>
            <Button
              onClick={toggleScreenShare}
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
                <DropdownMenuItem onClick={toggleRecording}>
                  {isRecording ? "Stop recording" : "Start recording"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLayout("grid")}>
                  <LucideLayout className="h-4 w-4 mr-2" />
                  Grid view
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("spotlight")}>
                  <LucidePresentation className="h-4 w-4 mr-2" />
                  Spotlight view
                </DropdownMenuItem>
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
                <Button variant="outline" size="sm" onClick={toggleMute}>
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
                <Button variant="outline" size="sm" onClick={toggleVideo}>
                  {isVideoOff ? "Turn on" : "Turn off"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Layout</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={layout === "grid" ? "default" : "outline"} size="sm" onClick={() => setLayout("grid")}>
                  <LucideLayout className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={layout === "spotlight" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout("spotlight")}
                >
                  <LucidePresentation className="h-4 w-4 mr-2" />
                  Spotlight
                </Button>
              </div>
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