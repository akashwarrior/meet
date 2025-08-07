"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "motion/react";
import { Check, Copy, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type MeetingInfoDialogProps = {
  link: string | null;
  onClose: () => void;
  onJoinNow: (link: string) => void;
};

export default function MeetingInfoDialog({
  link,
  onClose,
  onJoinNow,
}: MeetingInfoDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!link?.trim()) return;
    try {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await navigator.clipboard.writeText(link);
      toast.success("Meeting link copied", {
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast.error("Failed to copy link", { description: String(error) });
    }
  };

  return (
    <Dialog open={link !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full h-full bg-background overflow-hidden"
        >
          <DialogTitle className="flex justify-between items-center mb-3 text-xl font-semibold">
            Here&apos;s your joining information
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="focus-visible:ring-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Send this to people that you want to meet with. Make sure that you
            save it so that you can use it later, too.
          </p>

          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-neutral-800 p-3 rounded-md overflow-hidden">
            <div className="flex-1 truncate">{link}</div>
            <Button
              onClick={copyLink}
              variant="ghost"
              size="icon"
              className={copied ? "text-green-600" : ""}
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex justify-end items-center mt-6 gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            {link && <Button onClick={() => onJoinNow(link)}>Join now</Button>}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
