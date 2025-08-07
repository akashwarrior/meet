"use client";

import { useEffect, useState } from "react";
import { LazyMotion } from "motion/react";
import * as motion from "motion/react-m";
const loadFeature = () =>
  import("@/components/domAnimation").then((res) => res.default);

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null); // Cannot initialize here - [Hydration Issue]

  useEffect(() => {
    if (!time) {
      setTime(new Date());
    }
    const secondsLeft = 60 - new Date().getSeconds();
    const updateInterval = secondsLeft * 1000;

    const interval = setTimeout(() => setTime(new Date()), updateInterval);

    return () => {
      clearTimeout(interval);
    };
  }, [time]);

  return (
    time && (
      <LazyMotion features={loadFeature}>
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
      </LazyMotion>
    )
  );
}
