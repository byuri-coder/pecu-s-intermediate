import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        {...props}
    >
        <g>
            {/* Main hexagon P-shape */}
            <path 
                d="M32 2 L58 18 L58 50 L32 66 L6 50 L6 18 L32 2 Z M18 26 V42 H32 C42 42 42 26 32 26 H18 Z" 
                fill="hsl(var(--primary))" 
                stroke="none"
            />
            {/* Gold border for the P */}
            <path 
                d="M18 28 V40 H32 C40 40 40 28 32 28 H18 Z" 
                stroke="hsl(45, 100%, 51%)"
                strokeWidth="2.5"
                fill="none"
            />
            {/* Arrows pointing up */}
            <path 
                d="M28 36 L32 32 L36 36"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path 
                d="M28 31 L32 27 L36 31"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
    </svg>
);
