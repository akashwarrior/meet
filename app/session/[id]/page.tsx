"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  ArrowLeftRight,
  Download,
  Mic,
  MicOff,
  Monitor,
  Pause,
  Play,
  Settings,
  Shield,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SessionPage({ params }: { params: { id: string } }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isControlEnabled, setIsControlEnabled] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [quality, setQuality] = useState(75)
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([])
  const [newMessage, setNewMessage] = useState("")

  // Simulate connection process
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    setMessages([
      ...messages,
      {
        sender: "You",
        text: newMessage,
        time: timeString,
      },
    ])

    setNewMessage("")

    // Simulate response after a short delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "Remote User",
          text: "I can see your screen now. Let me take a look at the issue.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    }, 3000)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Connection status bar */}
      <div className="flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <span className="font-medium">Session: {params.id}</span>
          {isConnected ? (
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
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsAudioMuted(!isAudioMuted)}>
            {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsControlEnabled(!isControlEnabled)}>
                {isControlEnabled ? "Disable Remote Control" : "Enable Remote Control"}
              </DropdownMenuItem>
              <DropdownMenuItem>Change Quality Settings</DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Save Recording
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" size="sm">
            <X className="mr-2 h-4 w-4" />
            End Session
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main screen sharing area */}
        <div className="relative flex-1 bg-black">
          {!isConnected ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-white">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p>Establishing secure connection...</p>
                <p className="mt-2 text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          ) : isPaused ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-white">
                <Pause className="mx-auto h-16 w-16 mb-4 text-primary/80" />
                <p className="text-xl">Stream Paused</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsPaused(false)}>
                  Resume
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
              <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <Monitor className="h-24 w-24 text-primary/20" />
              </div>
            </div>
          )}

          {/* Control indicator */}
          {isConnected && isControlEnabled && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-background/80 px-3 py-1.5 text-sm backdrop-blur-sm">
              <ArrowLeftRight className="h-4 w-4 text-primary" />
              <span>Remote Control Enabled</span>
            </div>
          )}

          {/* Security indicator */}
          {isConnected && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-md bg-background/80 px-3 py-1.5 text-sm backdrop-blur-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Encrypted Connection</span>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-80 border-l bg-background">
          <Tabs defaultValue="chat">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="p-0">
              <div className="flex h-[calc(100vh-88px)] flex-col">
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <MessageSquare className="mb-2 h-12 w-12" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex gap-2 ${message.sender === "You" ? "justify-end" : ""}`}>
                          {message.sender !== "You" && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary">RU</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === "You" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium">{message.sender}</span>
                              <span className="text-xs opacity-70">{message.time}</span>
                            </div>
                            <p className="mt-1 text-sm">{message.text}</p>
                          </div>
                          {message.sender === "You" && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary">You</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      className="min-h-[60px] flex-1 resize-none"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit">Send</Button>
                  </form>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Connection Details</h3>
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Session ID:</span>
                        <span className="font-mono">{params.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-green-500">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>00:05:32</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Encryption:</span>
                        <span>End-to-end (AES-256)</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Quality Settings</h3>
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Video Quality</span>
                          <span className="text-sm text-muted-foreground">{quality}%</span>
                        </div>
                        <Slider
                          value={[quality]}
                          min={25}
                          max={100}
                          step={5}
                          onValueChange={(value) => setQuality(value[0])}
                          className="[&>span:first-child]:bg-primary"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Optimize for Speed</span>
                        <Switch checked={quality < 50} onCheckedChange={(checked) => setQuality(checked ? 40 : 75)} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Permissions</h3>
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Remote Control</span>
                        <Switch checked={isControlEnabled} onCheckedChange={setIsControlEnabled} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">File Transfer</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Session Recording</span>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
