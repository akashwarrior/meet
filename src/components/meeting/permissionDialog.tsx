import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import useMeetingPrefsStore from "@/store/meetingPrefs";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface PermissionDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
}

export default function PermissionDialog({
  showDialog,
  setShowDialog,
}: PermissionDialogProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const setMeetingPrefs = useMeetingPrefsStore(
    (state) => state.setMeetingPrefs,
  );

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent
        className="[&>button]:hidden border-none flex flex-col items-center rounded-2xl md:max-w-3xl!"
        aria-describedby={undefined}
      >
        <DialogTitle />
        <Image
          width={200}
          height={200}
          loading="lazy"
          src="/dialog_image.jpeg"
          alt="Permission illustration"
          className="w-1/2 rounded-lg max-w-2xs"
        />
        <h2 className="text-2xl font-normal text-center">
          Do you want people to see and hear you in the meeting?
        </h2>

        <p className="text-center text-muted-foreground">
          You can still turn off your microphone and camera anytime in the
          meeting.
        </p>
        <div className="flex w-full items-center justify-center gap-3 max-w-lg">
          <Button
            className="text-white py-5.5 rounded-full min-w-4/5 px-6"
            onClick={() => {
              navigator.mediaDevices
                .getUserMedia({ audio: true, video: true })
                .then((stream) => {
                  setShowDialog(false);
                  stream.getTracks().forEach((track) => {
                    track.stop();
                    stream.removeTrack(track);
                  });
                  setMeetingPrefs({
                    isAudioEnabled: true,
                    isVideoEnabled: true,
                  });
                })
                .catch((error) => {
                  console.error("Error getting media stream:", error);
                  toast.error("Media Error", {
                    description:
                      "Could not access selected devices. Please try different ones.",
                  });
                });
            }}
          >
            Use microphone and camera
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`text-primary rounded-full p-5 ${isCollapsed ? "rotate-180" : ""}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronDown />
          </Button>
        </div>

        <div
          className={cn(
            "w-11/12 overflow-hidden flex flex-col gap-4 items-center max-w-md",
            isCollapsed ? "h-auto" : "h-0",
          )}
        >
          <div className="flex gap-3 md:gap-4 w-full">
            <Button
              variant="outline"
              className="rounded-full flex-1 py-5 px-6.5 text-primary hover:text-primary hover:bg-primary/10!"
              onClick={() => {
                navigator.mediaDevices
                  .getUserMedia({ audio: true })
                  .then((stream) => {
                    setShowDialog(false);
                    stream.getTracks().forEach((track) => {
                      track.stop();
                      stream.removeTrack(track);
                    });
                    setMeetingPrefs({ isAudioEnabled: true });
                  })
                  .catch((error) => {
                    console.error("Error getting media stream:", error);
                    toast.error("Media Error", {
                      description:
                        "Could not access selected devices. Please try different ones.",
                    });
                  });
              }}
            >
              Use microphone
            </Button>

            <Button
              variant="outline"
              className="rounded-full flex-1 py-5 px-6.5 text-primary hover:text-primary hover:bg-primary/10!"
              onClick={() => {
                navigator.mediaDevices
                  .getUserMedia({ video: true })
                  .then((stream) => {
                    setShowDialog(false);
                    stream.getTracks().forEach((track) => {
                      track.stop();
                      stream.removeTrack(track);
                    });
                    setMeetingPrefs({ isVideoEnabled: true });
                  })
                  .catch((error) => {
                    console.error("Error getting media stream:", error);
                    toast.error("Media Error", {
                      description:
                        "Could not access selected devices. Please try different ones.",
                    });
                  });
              }}
            >
              Use camera
            </Button>
          </div>

          <Button
            variant="ghost"
            className="p-5 rounded-full"
            onClick={() => setShowDialog(false)}
          >
            Continue without microphone and camera
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
