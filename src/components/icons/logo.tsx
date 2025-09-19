import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        {...props}
    >
        <defs>
            <radialGradient id="gold-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{ stopColor: "#FFEDB3" }} />
                <stop offset="50%" style={{ stopColor: "#FFD700" }} />
                <stop offset="100%" style={{ stopColor: "#B8860B" }} />
            </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#gold-gradient)" />
        <circle cx="32" cy="32" r="28" fill="none" stroke="#B8860B" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="30" fill="none" stroke="#B8860B" strokeWidth="2" strokeOpacity="0.5" />

        <text
            x="50%"
            y="53%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#000"
            fontSize="38"
            fontFamily="Georgia, serif"
            fontWeight="bold"
            opacity="0.2"
            transform="translate(1 1)"
        >
            P
        </text>
        <text
            x="50%"
            y="52%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="38"
            fontFamily="Georgia, serif"
            fontWeight="bold"
            stroke="#B8860B"
            strokeWidth="0.5"
            strokeOpacity="0.8"
        >
            P
        </text>
    </svg>
);
