'use client'

import { useEffect, useRef, useState } from "react";

export function Timer({ rejectReq, time }: { rejectReq: () => void, time: number }) {
    const timeRef = useRef<NodeJS.Timeout>();
    const [timer, setTimer] = useState<number>(time);

    useEffect(() => {
        if (timer === null) return;
        const timeInterval = setTimeout(() => timer > 0 ? setTimer(timer - 1) : rejectReq(), 1000);
        timeRef.current = timeInterval;
        return () => {
            clearTimeout(timeRef.current);
            timeRef.current = undefined;
        }
    }, [timer, rejectReq]);

    return <span>
        {timer}
    </span>
}