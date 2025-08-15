"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Keyboard, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MeetingActionsProps = {
  loading: boolean;
  meetingCodeRef: React.RefObject<HTMLInputElement | null>;
  onStartInstant: () => void;
  onCreateLater: () => void;
  onJoin: () => void;
};

export default function MeetingActions({
  loading,
  meetingCodeRef,
  onStartInstant,
  onCreateLater,
  onJoin,
}: MeetingActionsProps) {
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
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full bg-background overflow-hidden"
          >
            <DropdownMenuItem
              onClick={onStartInstant}
              className="cursor-pointer px-4 py-3 hover:bg-primary/20 border-b"
            >
              Start an instant meeting
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCreateLater}
              className="cursor-pointer px-4 py-3 hover:bg-primary/20"
            >
              Create a meeting for later
            </DropdownMenuItem>
          </motion.div>
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
        onClick={onJoin}
      >
        Join
      </Button>
    </div>
  );
}
