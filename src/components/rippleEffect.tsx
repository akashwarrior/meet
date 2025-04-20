'use client';

import React, { useState, useEffect } from "react";

export default function Ripple({ isWhite }: { isWhite: boolean }) {
    const [rippleArray, setRippleArray] = useState<{
        x: number;
        y: number;
        size: number;
    }[]>([]);

    useEffect(() => {
        const duration = 2400;
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
        const rippleContainer = event.currentTarget.getBoundingClientRect();
        const size =
            rippleContainer.width > rippleContainer.height
                ? rippleContainer.width
                : rippleContainer.height;
        const x = event.pageX - rippleContainer.x - size / 2;
        const y = event.pageY - rippleContainer.y - size / 2;

        setRippleArray([...rippleArray, { x, y, size }]);
    };

    return (
        <div className="absolute top-0 bottom-0 left-0 right-0" onClick={addRipple}>
            {rippleArray.length > 0 &&
                rippleArray.map((ripple, index) =>
                    <span
                        key={"span" + index}
                        className={`scale-50 rounded-full absolute animate-ripple ${isWhite ? "bg-primary/20" : "bg-white/20"}`}
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