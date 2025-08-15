"use client";

import { useRef, useState } from "react";
import Header from "@/components/header";
import Image from "next/image";
import MeetingActions from "@/components/home/MeetingActions";
import MeetingInfoDialog from "@/components/home/MeetingInfoDialog";
import LoadingDialog from "@/components/home/LoadingDialog";
import { extractMeetingId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const meetingCodeRef = useRef<HTMLInputElement>(null);

  const generateMeetingLink = async (): Promise<string | null> => {
    try {
      setLoading(true);
      const response = await fetch("/api/meetings", { method: "POST" });
      const res = await response.json();
      if (response.ok) {
        return res.link;
      } else {
        toast.error(res.error, {
          description: "Please try again later",
        });
        return null;
      }
    } catch (error) {
      toast.error("Failed to create meeting", { description: String(error) });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startInstantMeeting = async () => {
    const link = await generateMeetingLink();
    if (link) {
      toast.success("Meeting created successfully", {
        description: "Redirecting to meeting...",
      });
      const id = extractMeetingId(link);
      router.push(`/meeting/${id}`);
    }
  };

  const scheduleForLater = async () => {
    const link = await generateMeetingLink();
    if (link) {
      setMeetingLink(link);
    }
  };

  const joinMeeting = async () => {
    const meetingCode = meetingCodeRef.current?.value || "";
    const id = extractMeetingId(meetingCode);

    if (!id) {
      meetingCodeRef.current?.focus();
      toast.error("Meeting code required", {
        description: "Please enter a meeting code to join",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/meetings/${id}`);
      const res = await response.json();

      if (response.ok) {
        toast.success(res.message, {
          description: "Redirecting to meeting...",
        });
        router.push(`/meeting/${id}`);
      } else {
        toast.error(res.error, {
          description: "Please check the meeting code and try again",
        });
      }
    } catch (error) {
      toast.error("Failed to join meeting", {
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background relative">
      <Header />

      <section className="mx-auto flex flex-col md:px-4 py-12 md:py-5 md:flex-row items-center justify-between max-w-7xl">
        <div className="max-w-lg md:mb-0 m-10">
          <h1 className="text-3xl md:text-5xl text-foreground mb-6">
            Video calls and meetings for everyone
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Connect, collaborate and celebrate from anywhere with Meet
          </p>

          <MeetingActions
            loading={loading}
            meetingCodeRef={meetingCodeRef}
            onStartInstant={startInstantMeeting}
            onCreateLater={scheduleForLater}
            onJoin={joinMeeting}
          />

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-muted-foreground">
              <span
                onClick={() => {
                  toast.info("This page is not available yet", {
                    description: "Please check back later :)",
                  });
                }}
                className="text-primary hover:underline cursor-pointer"
              >
                Learn more
              </span>{" "}
              about Meet
            </p>
          </div>
        </div>

        <div className="max-w-lg m-5 md:mx-auto">
          <Image
            width={500}
            height={500}
            priority
            src="/img.jpeg"
            alt="People in a video conference"
            className="w-full rounded-lg"
          />
        </div>
      </section>

      <MeetingInfoDialog
        link={meetingLink}
        onClose={() => setMeetingLink("")}
        onJoinNow={(link) => router.push(`/meeting/${extractMeetingId(link)}`)}
      />

      <LoadingDialog
        open={loading}
        message={`${meetingCodeRef.current?.value ? "Finding" : "Creating"} your meeting...`}
      />
    </main>
  );
}
