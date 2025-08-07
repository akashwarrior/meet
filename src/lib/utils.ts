import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractMeetingId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || trimmed;
  } catch {
    const withoutQuery = trimmed.split("?")[0].split("#")[0];
    const segments = withoutQuery.split("/").filter(Boolean);
    return segments[segments.length - 1] || trimmed;
  }
}
