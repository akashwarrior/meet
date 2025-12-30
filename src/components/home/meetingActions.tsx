"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Keyboard, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MeetingInfoDialog from "@/components/home/meetingInfoDialog";
import LoadingDialog from "@/components/home/loadingDialog";
import { extractMeetingId } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type RequestError = Error & { status?: number };

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const requestJson = async <T,>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, init);
  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    const error = new Error(body?.error ?? "Request failed") as RequestError;
    error.status = response.status;
    throw error;
  }

  return body;
};

export default function MeetingActions() {
  const router = useRouter();
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Creating your meeting...",
  );
  const meetingCodeRef = useRef<HTMLInputElement>(null);

  const generateMeetingLink = async (): Promise<string | null> => {
    try {
      setLoadingMessage("Creating your meeting...");
      setLoading(true);
      const meeting = await requestJson<{ link: string }>("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allowGuestJoin: false }),
      });
      return meeting.link;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create meeting"), {
        description: "Please try again later",
      });
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

  const createGuestFriendlyMeeting = async () => {
    try {
      setLoadingMessage("Creating guest-friendly meeting...");
      setLoading(true);
      const meeting = await requestJson<{ link: string }>("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allowGuestJoin: true }),
      });
      setMeetingLink(meeting.link);
      toast.success("Guest access enabled", {
        description: "Anyone with this link can join.",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create meeting"), {
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
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
      setLoadingMessage("Finding your meeting...");
      setLoading(true);
      const meeting = await requestJson<{ message: string }>(
        `/api/meetings/${id}`,
      );
      toast.success(meeting.message, {
        description: "Redirecting to meeting...",
      });
      router.push(`/meeting/${id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to join meeting"), {
        description: "Please check the meeting code and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-3 xl:items-center relative">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-center flex-1 h-fit py-4 hover:ring-4 hover:ring-primary/50 focus-visible:ring-primary/50">
            <Video className="mr-2 h-5 w-5" />
            New meeting
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) bg-background">
          <div className="w-full h-full bg-background overflow-hidden">
            <DropdownMenuItem
              onClick={startInstantMeeting}
              className="cursor-pointer px-4 py-3 hover:bg-primary/20 border-b"
            >
              Start an instant meeting
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={scheduleForLater}
              className="cursor-pointer px-4 py-3 hover:bg-primary/20"
            >
              Create a meeting for later
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={createGuestFriendlyMeeting}
              className="cursor-pointer px-4 py-3 hover:bg-primary/20 border-t"
            >
              Create a guest-friendly meeting
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center bg-background border-2 rounded-2xl flex-1 focus-within:border-primary transition-[border-color] duration-200 px-2">
        <Keyboard size={28} />
        <Input
          type="text"
          placeholder="Enter a code or link"
          ref={meetingCodeRef}
          disabled={loading}
          className="border-none h-full focus-visible:ring-0 py-4 bg-transparent!"
        />
      </div>

      <Button
        variant="ghost"
        className="text-base font-bold rounded-full px-6 py-5"
        onClick={joinMeeting}
      >
        Join
      </Button>

      <MeetingInfoDialog
        link={meetingLink}
        onClose={() => setMeetingLink("")}
        onJoinNow={(link) => router.push(`/meeting/${extractMeetingId(link)}`)}
      />

      <LoadingDialog open={loading} message={loadingMessage} />
    </div>
  );
}
