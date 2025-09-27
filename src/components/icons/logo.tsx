"use client";

import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="none"
        {...props}
    >
        <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path 
            d="M50 15 L35 25 V 75 L50 85 H65 L80 75 V 45 H65 V 35 H50 V 25 H65 L80 35 V 25 L65 15 H50 Z M50 35 H65 V 45 H50 V 35 Z M50 55 V 75 H65 L70 70 V 50 L65 45 H50 V 55 Z"
            fill="url(#gold-gradient)"
        />
        <path
            d="M50 25 L65 35 V 45 H50 V 25 Z"
            fill="url(#gold-gradient)"
            style={{ filter: 'brightness(0.9)' }}
        />
        <path
            d="M50 55 V 75 H65 L70 70 V 50 L65 45 H50 V 55 Z"
            fill="url(#gold-gradient)"
            style={{ filter: 'brightness(1.1)' }}
        />
        <path
            d="M35 25 L50 15 L65 25 L50 35 L35 25 Z"
            fill="url(#gold-gradient)"
            style={{ filter: 'brightness(1.2)' }}
        />
    </svg>
);