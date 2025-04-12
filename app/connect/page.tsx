"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Cast, Copy, Loader2, Monitor, Share2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function ConnectPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionId, setConnectionId] = useState("")
  const [generatedId, setGeneratedId] = useState("")

  const handleConnect = () => {
    if (!connectionId) return

    setIsConnecting(true)

    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false)
      router.push(`/session/${connectionId}`)
    }, 2000)
  }

  const handleHostSession = () => {
    setIsConnecting(true)

    // Generate a random connection ID
    const randomId = Math.random().toString(36).substring(2, 10)
    setGeneratedId(randomId)

    // Simulate connection setup
    setTimeout(() => {
      setIsConnecting(false)
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedId)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Connect" text="Start a new screen sharing session or join an existing one." />

      <Tabs defaultValue="join" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="join">Join Session</TabsTrigger>
          <TabsTrigger value="host">Host Session</TabsTrigger>
        </TabsList>

        <TabsContent value="join" className="mt-6">
          <Card className="border-primary/10 hover:border-primary/20 transition-colors">
            <CardHeader>
              <CardTitle>Join a Session</CardTitle>
              <CardDescription>Enter the connection ID provided by the host to join their session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connection-id">Connection ID</Label>
                <Input
                  id="connection-id"
                  placeholder="Enter connection ID"
                  value={connectionId}
                  onChange={(e) => setConnectionId(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Connection Type</Label>
                <Select defaultValue="view">
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="control">Remote Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleConnect} disabled={!connectionId || isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="host" className="mt-6">
          <Card className="border-primary/10 hover:border-primary/20 transition-colors">
            <CardHeader>
              <CardTitle>Host a Session</CardTitle>
              <CardDescription>Share your screen and allow others to connect to your session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!generatedId ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Screen to Share</Label>
                    <Select defaultValue="entire">
                      <SelectTrigger>
                        <SelectValue placeholder="Select screen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entire">Entire Screen</SelectItem>
                        <SelectItem value="application">Application Window</SelectItem>
                        <SelectItem value="browser">Browser Tab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quality Settings</Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Faster)</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="high">High (Better Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-4">
                    <Label className="text-base">Permissions</Label>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="remote-control">Allow Remote Control</Label>
                        <p className="text-sm text-muted-foreground">Let others control your mouse and keyboard</p>
                      </div>
                      <Switch id="remote-control" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="file-transfer">Allow File Transfer</Label>
                        <p className="text-sm text-muted-foreground">Enable sending and receiving files</p>
                      </div>
                      <Switch id="file-transfer" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="record-session">Record Session</Label>
                        <p className="text-sm text-muted-foreground">Save a recording of this session</p>
                      </div>
                      <Switch id="record-session" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/50 p-6 text-center">
                    <h3 className="mb-2 text-sm font-medium">Your Connection ID</h3>
                    <div className="flex items-center justify-center gap-2">
                      <code className="relative rounded bg-primary/10 px-[0.5rem] py-[0.2rem] font-mono text-lg font-semibold">
                        {generatedId}
                      </code>
                      <Button variant="outline" size="icon" onClick={copyToClipboard} className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Share this ID with others to let them join your session
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share via Email
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Copy className="h-4 w-4" />
                      Copy Invite Link
                    </Button>
                  </div>

                  <div className="rounded-md bg-primary/5 p-4 border border-primary/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Your connection is secure and encrypted</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!generatedId ? (
                <Button className="w-full" onClick={handleHostSession} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating session...
                    </>
                  ) : (
                    <>
                      <Cast className="mr-2 h-4 w-4" />
                      Start Sharing
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex w-full gap-4">
                  <Button variant="outline" className="w-1/2" onClick={() => setGeneratedId("")}>
                    Cancel
                  </Button>
                  <Button className="w-1/2" onClick={() => router.push(`/session/${generatedId}/host`)}>
                    <Monitor className="mr-2 h-4 w-4" />
                    Open Session
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
