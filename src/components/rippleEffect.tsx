'use client';

import React, { useState, useEffect } from "react";

export default function RippleEffect({ isWhite }: { isWhite: boolean }) {
    const [rippleArray, setRippleArray] = useState<{
        x: number;
        y: number;
        size: number;
    }[]>([]);

    useEffect(() => {
        const duration = 2000;
        if (rippleArray.length > 0) {
            const bounce = setTimeout(() => {
                setRippleArray((prev) => {
                    const newRippleArray = [...prev];
                    newRippleArray.shift();
                    return newRippleArray;
                });
                clearTimeout(bounce);
            }, duration);

            return () => {
                clearTimeout(bounce);
            };
        }
    }, [rippleArray])


    const addRipple = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const { width, height, x: rippleX, y: RippleY } = event.currentTarget.getBoundingClientRect();
        const size = width > height ? width : height;
        const x = event.pageX - rippleX - size / 2;
        const y = event.pageY - RippleY - size / 2;

        setRippleArray([...rippleArray, { x, y, size }]);
    };

    return (
        <div className="absolute top-0 bottom-0 left-0 right-0" onClick={addRipple}>
            {rippleArray.length > 0 &&
                rippleArray.map((ripple, index) =>
                    <span
                        key={"span" + index}
                        className={`scale-50 rounded-full absolute animate-ripple ${isWhite ? "bg-primary/20 dark:bg-primary/50" : "bg-white/20"}`}
                        style={{
                            top: ripple.y,
                            left: ripple.x,
                            width: ripple.size,
                            height: ripple.size
                        }}
                    />
                )}
        </div>
    );
};