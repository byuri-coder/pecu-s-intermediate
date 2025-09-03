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
            {/* P shape with golden stroke */}
            <path d="M12 15a3 3 0 0 0 0-6H9v6h3z" stroke="hsl(45, 100%, 51%)" />
            <path d="M9 9V19" stroke="hsl(45, 100%, 51%)" />
            
            {/* Arrows pointing up */}
            <path d="m11 9 1-2 1 2" stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
            <path d="m11 12 1-2 1 2" stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
        </g>
    </svg>
);
