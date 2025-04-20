'use client';

import { useEffect, useState } from "react";

export function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const secondsLeft = 60 - new Date().getSeconds();
        const updateInterval = (secondsLeft * 1000);

        const interval = setTimeout(() => {
            setTime(new Date());
        }, updateInterval);

        return () => clearTimeout(interval);
    }, [time]);

    return (
        <div className="text-sm md:text-lg text-muted-foreground">
            {time.toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit" })}
            <span> • </span>
            {time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
        </div>
    );
}