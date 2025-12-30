"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timeoutDuration = (60 - new Date().getSeconds()) * 1000;
    let interval: ReturnType<typeof setInterval> | undefined;

    const timeout = setTimeout(() => {
      setTime(new Date());
      interval = setInterval(() => setTime(new Date()), 60_000);
    }, timeoutDuration);

    return () => {
      clearTimeout(timeout);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    time && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex items-center gap-1 text-muted-foreground"
      >
        {time.toLocaleTimeString("en-IN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })}
        <span className="hidden sm:inline">
          {" • "}
          {time.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </span>
      </motion.div>
    )
  );
}
