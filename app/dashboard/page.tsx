"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  Calendar,
  Clock,
  Download,
  Monitor,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Badge } from "@/components/ui/badge"

// Mock data for recent connections
const recentConnections = [
  {
    id: "conn-1",
    name: "John's Laptop",
    type: "Remote Control",
    date: "2025-04-12T10:30:00",
    duration: "45 minutes",
    status: "Completed",
  },
  {
    id: "conn-2",
    name: "Marketing Team",
    type: "Screen Sharing",
    date: "2025-04-11T14:15:00",
    duration: "1 hour 20 minutes",
    status: "Completed",
  },
  {
    id: "conn-3",
    name: "Support Session #1234",
    type: "Remote Control",
    date: "2025-04-10T09:00:00",
    duration: "32 minutes",
    status: "Completed",
  },
  {
    id: "conn-4",
    name: "Design Review",
    type: "Screen Sharing",
    date: "2025-04-09T16:45:00",
    duration: "55 minutes",
    status: "Completed",
  },
  {
    id: "conn-5",
    name: "Server Maintenance",
    type: "Remote Control",
    date: "2025-04-08T20:30:00",
    duration: "2 hours 15 minutes",
    status: "Completed",
  },
]

// Mock data for saved connections
const savedConnections = [
  {
    id: "saved-1",
    name: "Development Server",
    type: "Remote Control",
    lastConnected: "2025-04-10T15:20:00",
  },
  {
    id: "saved-2",
    name: "Marketing Workstation",
    type: "Screen Sharing",
    lastConnected: "2025-04-05T11:45:00",
  },
  {
    id: "saved-3",
    name: "Client Support",
    type: "Remote Control",
    lastConnected: "2025-04-01T09:30:00",
  },
]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage your connections and view recent activity.">
        <Link href="/connect">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Connection
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/10 hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Monitor className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">54h 23m</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No active sessions</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Connections</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedConnections.length}</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="recent">Recent Connections</TabsTrigger>
            <TabsTrigger value="saved">Saved Connections</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search connections..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Connections</CardTitle>
              <CardDescription>View your recent connection history and activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                          Date
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentConnections
                      .filter(
                        (conn) =>
                          conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conn.type.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .map((connection) => (
                        <TableRow key={connection.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{connection.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={connection.type === "Remote Control" ? "default" : "secondary"}
                              className="font-normal"
                            >
                              {connection.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(connection.date)}</TableCell>
                          <TableCell>{connection.duration}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            >
                              {connection.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Recording
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Monitor className="mr-2 h-4 w-4" />
                                  Reconnect
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Settings className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Connections</CardTitle>
              <CardDescription>Access your saved connections for quick reconnection.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Connected</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedConnections
                      .filter(
                        (conn) =>
                          conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conn.type.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .map((connection) => (
                        <TableRow key={connection.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{connection.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={connection.type === "Remote Control" ? "default" : "secondary"}
                              className="font-normal"
                            >
                              {connection.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(connection.lastConnected)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Monitor className="mr-2 h-4 w-4" />
                                  Connect
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
