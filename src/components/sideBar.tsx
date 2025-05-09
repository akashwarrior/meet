'use client'

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { FormEvent, memo, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Mic, MicOff, Send, Users, Video, VideoOff, X } from "lucide-react";
import useSidebarOpenStore from "@/store/sideBar";
import { ReceivedChatMessage, useChat } from "@livekit/components-react";
import { useParticipants } from "@livekit/components-react";


const SideBar = memo(() => {
    const chatEndRef = useRef<HTMLDivElement>(null)
    const messageRef = useRef<HTMLInputElement>(null);
    const participants = useParticipants()
    const { sidebarOpen, setSidebarOpen } = useSidebarOpenStore();
    const { chatMessages, send } = useChat();

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [chatMessages])


    const SendMessage = async (e: FormEvent) => {
        e.preventDefault()
        const message = messageRef.current?.value || ""
        if (!message.trim()) return
        messageRef.current!.value = ""
        send(message)
    }

    return (
        <div className={cn("bg-background overflow-hidden border max-w-fulwl w-sm flex flex-col transition-all duration-200 ease-in-out rounded-lg",
            sidebarOpen ? "translate-x-0" : "translate-x-full w-0",
        )}>
            <Tabs value={sidebarOpen as string}
                onValueChange={(value) => {
                    if (value === "participants" || value === "chat") {
                        setSidebarOpen(value)
                    } else {
                        setSidebarOpen(null)
                    }
                }}
                className="flex flex-col h-full">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <TabsList className="w-full">
                        <TabsTrigger value="participants" className="flex-1">
                            <Users className="h-4 w-4 mr-2" />
                            People ({participants.length})
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                        </TabsTrigger>
                    </TabsList>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <TabsContent value="participants" className="flex-1 p-0 m-0 overflow-hidden">
                    <h3 className="text-sm font-medium text-muted-foreground my-2 mx-4">Participants</h3>
                    <ScrollArea className="h-full px-6">
                        {participants.map(({ sid, name, isMicrophoneEnabled, isCameraEnabled }) => (
                            <div key={sid} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-green-500">{name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center text-muted-foreground gap-4">
                                        {isMicrophoneEnabled ? <Mic size="18" /> : <MicOff size="18" />}
                                        {isCameraEnabled ? <Video size="18" /> : <VideoOff size="18" />}
                                    </div>
                                    {/* <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreHorizontal size="6" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                {participant.name ? "Unmute" : "Mute"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                // onClick={() => removeParticipant(participant.id)}
                                                className="text-red-500"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu> */}
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {chatMessages.map(({ id, message, timestamp, from }: ReceivedChatMessage) => (
                                <div key={id} className={`flex flex-col ${from?.allParticipantsAllowedToSubscribe ? "bg-primary/15" : "bg-gray-100 dark:bg-neutral-800"} rounded-lg py-3 px-4`}>
                                    <div className="flex items-center mb-1">
                                        <span className={cn("font-medium mr-2", from?.allParticipantsAllowedToSubscribe && "text-blue-500 dark:text-blue-400")}>
                                            {from.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{new Date(timestamp).toLocaleTimeString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>
                                    <p className={cn("text-foreground", from?.allParticipantsAllowedToSubscribe && "text-muted-foreground italic")}>
                                        {message}
                                    </p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </ScrollArea>
                    <form onSubmit={SendMessage} className="p-4 border-t border-border flex items-center">
                        <Input
                            type="text"
                            placeholder="Send a message to everyone"
                            ref={messageRef}
                            className="flex-1 mr-2 focus-visible:ring-primary focus-visible:border-primary border-primary/50"
                        />
                        <Button type="submit" size="icon" variant="ghost">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    )
})

SideBar.displayName = "SideBar"
export default SideBar