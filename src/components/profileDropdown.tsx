"use client";

import { signOut } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { LogOut, HelpCircle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileDropdownProps {
  userName: string;
  email: string;
}

export default function ProfileDropdown({
  userName,
  email,
}: ProfileDropdownProps) {
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-8 px-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group">
          <div className="bg-primary-foreground text-primary text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full">
            {userName.charAt(0).toUpperCase()}
          </div>
          <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center space-x-3 py-1">
            <div className="bg-primary text-primary-foreground font-bold text-lg w-10 h-10 flex items-center justify-center rounded-full">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userName || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer" asChild>
          <a
            href="https://github.com/akashwarrior/meet"
            target="_blank"
            className="flex items-center"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
