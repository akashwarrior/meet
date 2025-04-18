import { memo, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Mic, MicOff, MoreHorizontal, Video, VideoOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Participant } from "@/lib/webrtc-service";

export const CallSidebar = ({ participants }: { participants: Participant[] }) => {
    const [showWaitingRoom, setShowWaitingRoom] = useState(false);
    const [waitingRoomCount, setWaitingRoomCount] = useState(2);

    // Handle sending a message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
    }

    // Handle admitting participants from waiting room
    const admitFromWaitingRoom = () => {
        const admitAll = waitingRoomCount <= 1;
        if (admitAll) {
            setWaitingRoomCount(0)
            setShowWaitingRoom(false)
        } else {
            setWaitingRoomCount((prev) => Math.max(0, prev - 1))
            if (waitingRoomCount <= 1) {
                setShowWaitingRoom(false)
            }
        }
    }

    return (
        <div className="w-80 border-l bg-background flex flex-col overflow-hidden">
            <Tabs defaultValue="participants" className="flex flex-col h-full">
                <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="participants" className="relative">
                        Participants
                        {showWaitingRoom && (
                            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                                {waitingRoomCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="relative">
                        Chat
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="flex-1 overflow-hidden flex flex-col">
                    {showWaitingRoom && (
                        <div className="p-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{waitingRoomCount} in waiting room</p>
                                <p className="text-xs text-muted-foreground">Waiting for admission</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={admitFromWaitingRoom}>
                                    Admit
                                </Button>
                                <Button size="sm" variant="outline" onClick={admitFromWaitingRoom}>
                                    Admit All
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Host</h3>
                                <Button variant="ghost" size="sm">
                                    Mute All
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{participants[0]?.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{participants[0]?.name}</p>
                                            <p className="text-xs text-muted-foreground">Host</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {participants[0]?.audio ? (
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                                <MicOff className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Mic className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {participants[0]?.video ? (
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Video className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                                <VideoOff className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">
                                    Participants ({participants.length - 1})
                                </h3>
                            </div>
                            <div className="space-y-1">
                                {participants.map(
                                    (participant, idx) =>
                                        idx && <ParticipantRow
                                            key={participant.id}
                                            participant={participant}
                                            reRender={participant.video || participant.audio}
                                        />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t p-4">
                        <Button variant="outline" className="w-full">
                            Invite Participants
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col">
                    <ChatTab />

                    <div className="border-t p-4">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Textarea
                                placeholder="Type a message..."
                                className="min-h-[60px] flex-1 resize-none"
                            />
                            <Button type="submit">Send</Button>
                        </form>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const ChatTab = memo(() => {
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<{
        id: string
        sender: string
        text: string
        time: string
        isHost?: boolean
    }[]>([])

    // Scroll to bottom of chat when new messages arrive
    useEffect(() => {
        if (chatScrollRef.current && messages.length > 0) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
        }
    }, [messages]);

    return (
        <div className="flex-1 p-4 overflow-y-auto" ref={chatScrollRef}>
            {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <MessageSquareIcon className="mb-2 h-12 w-12" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex gap-2 ${message.sender === "You" ? "justify-end" : ""}`}>
                            {message.sender !== "You" && message.sender !== "System" && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${message.sender === "You"
                                    ? "bg-primary text-primary-foreground"
                                    : message.sender === "System"
                                        ? "bg-muted/50 text-muted-foreground text-xs"
                                        : "bg-muted"
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-medium">
                                        {message.sender}
                                        {message.isHost && <Badge className="ml-1 text-[10px] py-0">Host</Badge>}
                                    </span>
                                    <span className="text-xs opacity-70">{message.time}</span>
                                </div>
                                <p className="mt-1 text-sm">{message.text}</p>
                            </div>
                            {message.sender === "You" && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>You</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
});


const ParticipantRow = memo(({ participant, reRender }: { participant: Participant, reRender: any }) => {
    return (
        <div
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
        >
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{participant.name!}</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {participant.audio ? (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                        <MicOff className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Mic className="h-4 w-4" />
                    </Button>
                )}
                {participant.video ? (
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Video className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                        <VideoOff className="h-4 w-4" />
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Make Host</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
});

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
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