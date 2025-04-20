"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LucideVideo, LucideCalendar, LucideUsers, LucideArrowLeft, LucideCopy } from "lucide-react"
import { toast } from "sonner"

export default function CreateMeeting() {
    const router = useRouter()
    const [meetingName, setMeetingName] = useState("")
    const [isScheduled, setIsScheduled] = useState(false)
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [meetingCreated, setMeetingCreated] = useState(false)
    const [meetingId, setMeetingId] = useState("")

    const handleCreateMeeting = () => {
        setIsLoading(true)

        // Generate a random meeting ID
        const newMeetingId = Math.random().toString(36).substring(2, 12)
        setMeetingId(newMeetingId)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            if (isScheduled) {
                setMeetingCreated(true)
                toast.success("Meeting scheduled", {
                    description: `Your meeting has been scheduled for ${date} at ${time}`,
                })
            } else {
                router.push(`/meeting/${newMeetingId}`)
            }
        }, 1000)
    }

    const copyMeetingLink = () => {
        const link = `${window.location.origin}/meeting/${meetingId}`
        navigator.clipboard.writeText(link)
        toast.info("Meeting link copied", {
            description: "Share this link with others to invite them",
        })
    }

    const joinMeeting = () => {
        router.push(`/meeting/${meetingId}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4 py-4 flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2">
                        <LucideArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center">
                        <svg viewBox="0 0 87 30" className="h-6 w-auto text-gray-600" fill="currentColor">
                            <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
                        </svg>
                        <span className="ml-2 text-xl font-medium text-gray-800">Meet</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {!meetingCreated ? (
                        <>
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create a new meeting</h1>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <LucideVideo className="mr-2 h-5 w-5 text-blue-600" />
                                        Meeting Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="meeting-name">Meeting name</Label>
                                        <Input
                                            id="meeting-name"
                                            placeholder="Weekly Team Sync"
                                            value={meetingName}
                                            onChange={(e) => setMeetingName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch id="schedule" checked={isScheduled} onCheckedChange={setIsScheduled} />
                                        <Label htmlFor="schedule" className="flex items-center">
                                            <LucideCalendar className="mr-2 h-4 w-4" />
                                            Schedule for later
                                        </Label>
                                    </div>

                                    {isScheduled && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="date">Date</Label>
                                                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="time">Time</Label>
                                                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="flex items-center">
                                            <LucideUsers className="mr-2 h-4 w-4" />
                                            Participants
                                        </Label>
                                        <div className="text-sm text-gray-500">You can invite participants after creating the meeting.</div>
                                    </div>

                                    <div className="pt-4 flex justify-end space-x-4">
                                        <Button variant="outline" onClick={() => router.push("/")}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCreateMeeting} disabled={isLoading || (isScheduled && (!date || !time))}>
                                            {isLoading ? "Creating..." : isScheduled ? "Schedule Meeting" : "Start Meeting Now"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">Meeting Scheduled</h1>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <LucideVideo className="mr-2 h-5 w-5 text-blue-600" />
                                        {meetingName || "New Meeting"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Meeting details</Label>
                                        <div className="p-3 bg-gray-50 rounded-md">
                                            <div className="mb-2">
                                                <span className="text-sm font-medium">Date:</span> {date}
                                            </div>
                                            <div className="mb-2">
                                                <span className="text-sm font-medium">Time:</span> {time}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Meeting link:</span>
                                                <Button variant="ghost" size="sm" onClick={copyMeetingLink} className="flex items-center">
                                                    <LucideCopy className="h-4 w-4 mr-1" />
                                                    Copy
                                                </Button>
                                            </div>
                                            <div className="text-sm text-gray-600 break-all">
                                                {`${window.location.origin}/meeting/${meetingId}`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end space-x-4">
                                        <Button variant="outline" onClick={() => router.push("/")}>
                                            Back to Home
                                        </Button>
                                        <Button onClick={joinMeeting}>Join Now</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}