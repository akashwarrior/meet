import MeetingFooter from "@/components/meeting/meetingFooter";
import MeetingHeader from "@/components/meeting/meetingHeader";
import SideBar from "@/components/meeting/sideBar";
import VideoGrid from "@/components/meeting/videoGrid";

export default function MeetingConnectedShell({
  meetingId,
}: {
  meetingId: string;
}) {
  return (
    <main className="h-screen flex flex-col bg-linear-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1)_0%,transparent_50%)] pointer-events-none" />

      <MeetingHeader meetingId={meetingId} />
      <div className="flex-1 flex overflow-hidden relative z-10">
        <VideoGrid />
        <SideBar />
      </div>
      <MeetingFooter />
    </main>
  );
}
