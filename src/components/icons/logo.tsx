import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="hsl(var(--primary))" stroke="none" />
        <g transform="translate(0, -1)">
            <path d="M8 15V9h4a3 3 0 010 6H8z" stroke="hsl(45, 100%, 51%)" />
            <path d="M11.5 13.5l-1-1" stroke="hsl(45, 100%, 51%)" />
            <path d="M12.5 13.5l1-1" stroke="hsl(45, 100%, 51%)" />
            <path d="M12 11.5V10" stroke="hsl(45, 100%, 51%)" />
        </g>
    </svg>
);