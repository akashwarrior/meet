import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface PermissionDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  setIsAudioEnabled: (enabled: boolean) => void;
  setIsVideoEnabled: (enabled: boolean) => void;
  onPermissionGranted: (kind: "audio" | "video" | "both") => void;
}

export default function PermissionDialog({
  showDialog,
  setShowDialog,
  setIsAudioEnabled,
  setIsVideoEnabled,
  onPermissionGranted,
}: PermissionDialogProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const requestAccess = async (
    constraints: MediaStreamConstraints,
    prefs: {
      isAudioEnabled?: boolean;
      isVideoEnabled?: boolean;
    },
    kind: "audio" | "video" | "both",
  ) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setShowDialog(false);
      stream.getTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });
      if (typeof prefs.isAudioEnabled === "boolean") {
        setIsAudioEnabled(prefs.isAudioEnabled);
      }
      if (typeof prefs.isVideoEnabled === "boolean") {
        setIsVideoEnabled(prefs.isVideoEnabled);
      }
      onPermissionGranted(kind);
    } catch (error) {
      console.error("Error getting media stream:", error);
      toast.error("Media Error", {
        description:
          "Could not access selected devices. Please try different ones.",
      });
    }
  };

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
            onClick={() =>
              void requestAccess(
                { audio: true, video: true },
                {
                  isAudioEnabled: true,
                  isVideoEnabled: true,
                },
                "both",
              )
            }
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
              onClick={() =>
                void requestAccess(
                  { audio: true },
                  { isAudioEnabled: true },
                  "audio",
                )
              }
            >
              Use microphone
            </Button>

            <Button
              variant="outline"
              className="rounded-full flex-1 py-5 px-6.5 text-primary hover:text-primary hover:bg-primary/10!"
              onClick={() =>
                requestAccess(
                  { video: true },
                  { isVideoEnabled: true },
                  "video",
                )
              }
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
