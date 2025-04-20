import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LucideVideo, LucideKeyboard } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LiveClock } from "@/components/liveClock"

export default async function Home() {
  return (
    <div className="bg-background">
      <header>
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg viewBox="0 0 87 30" className="h-6 w-auto text-foreground" fill="currentColor">
              <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
            </svg>
            <span className="ml-2 text-xl font-medium text-foreground">MeetSync</span>
          </div>
          <div className="flex items-center space-x-4">
            <LiveClock />
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 py-8 md:py-12 md:flex md:items-center md:justify-between">
        <div className="max-w-lg md:mb-0 mx-10">
          <h1 className="text-3xl md:text-5xl text-foreground mb-6">
            Video calls and meetings for everyone.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Connect, collaborate and celebrate from anywhere with MeetSync
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center justify-center">
            {/* <Link href="/create-meeting" > */}
            <Button className="hover:shadow-secondary text-white flex items-center justify-center p-6! rounded-full z-10 relative overflow-hidden">
              <LucideVideo />
              New meeting
            </Button>
            {/* </Link> */}
            <div className="flex items-center bg-background border border-input rounded-2xl px-3 w-full focus-within:ring-2 focus-within:ring-primary">
              <LucideKeyboard size={28} />
              <Input
                type="text"
                placeholder="Enter a code or link"
                className="border-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 bg-background py-3.5"
              />
            </div>
            <Button variant="ghost" className="text-primary font-bold rounded-full px-6 py-5.5">
              Join
            </Button>
          </div>
          <div className="mt-10 border-t border-border pt-6">
            <p className="text-muted-foreground">
              <Link href="/learn-more" className="text-primary hover:underline">
                Learn more
              </Link>{" "}
              about Google MeetSync
            </p>
          </div>
        </div>
        <div className="md:w-5/12">
          <img
            src="/placeholder.svg"
            alt="People in a video conference"
            className="w-full rounded-lg shadow-lg dark:border dark:border-border"
          />
        </div>
      </main>
    </div>
  )
}