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
            <linearGradient id="gold-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#b8860b" />
                <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
             <linearGradient id="inner-gold-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#b8860b" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
        </defs>
        
        {/* Outer circle of the coin */}
        <circle cx="50" cy="50" r="48" fill="url(#gold-gradient)" stroke="#8c6d1f" strokeWidth="2"/>
        
        {/* Inner circle border */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#8c6d1f" strokeWidth="1.5"/>

        {/* Stylized 'P' */}
        <path 
            d="M40 30 L40 70 L55 70 C 65 70 70 65 70 50 C 70 35 65 30 55 30 L40 30 Z M45 35 L55 35 C 62 35 65 38 65 50 C 65 62 62 65 55 65 L45 65 L45 35 Z"
            fill="url(#inner-gold-gradient)"
        />
    </svg>
);