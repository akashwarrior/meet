'use client';

import { useState, useEffect, MouseEvent, useImperativeHandle } from "react";

const DURATION = 2000;

export default function RippleEffect({ isWhite, ref }: { isWhite: boolean, ref: React.RefObject<{ addRipple: (event: MouseEvent<HTMLButtonElement>) => void } | null> }) {
    const [rippleArray, setRippleArray] = useState<{
        x: number;
        y: number;
        size: number;
    }[]>([]);

    useEffect(() => {
        if (rippleArray.length > 0) {
            const bounce = setTimeout(() => {
                setRippleArray((prev) => {
                    const newRippleArray = [...prev];
                    newRippleArray.shift();
                    return newRippleArray;
                });
                clearTimeout(bounce);
            }, DURATION);

            return () => {
                clearTimeout(bounce);
            };
        }
    }, [rippleArray])

    useImperativeHandle(ref, () => ({
        addRipple: (event: MouseEvent<HTMLButtonElement>) => {
            const { width, height, x: rippleX, y: RippleY } = event.currentTarget.getBoundingClientRect();
            const size = (width > height ? width : height) / 2;
            const x = event.pageX - rippleX - size / 2;
            const y = event.pageY - RippleY - size / 2;

            setRippleArray([...rippleArray, { x, y, size }]);
        },
    }));

    return (
        <>
            {rippleArray.map((ripple, index) =>
                <span
                    key={"span" + index}
                    className={`rounded-full absolute animate-ripple ${isWhite ? "bg-primary/20 dark:bg-primary/50" : "bg-white/20"}`}
                    style={{
                        top: ripple.y,
                        left: ripple.x,
                        width: ripple.size,
                        height: ripple.size
                    }}
                />
            )}
        </>
    );
};