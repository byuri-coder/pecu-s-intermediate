import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        {...props}
    >
        <defs>
            <radialGradient id="gold-metal" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" style={{ stopColor: "#FFFDE4" }} />
                <stop offset="40%" style={{ stopColor: "#FFD700" }} />
                <stop offset="80%" style={{ stopColor: "#B8860B" }} />
                <stop offset="100%" style={{ stopColor: "#8B6914" }} />
            </radialGradient>
            <filter id="relief-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
                <feOffset in="blur" dx="0.5" dy="0.5" result="offsetBlur" />
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#FFD700" result="specOut">
                    <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
                <feMerge>
                    <feMergeNode in="offsetBlur" />
                    <feMergeNode in="litPaint" />
                </feMerge>
            </filter>
        </defs>
        
        {/* Coin Body */}
        <circle cx="32" cy="32" r="30" fill="url(#gold-metal)" />
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(139, 105, 20, 0.5)" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(100, 70, 0, 0.7)" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="31" fill="none" stroke="rgba(255, 237, 179, 0.3)" strokeWidth="1" />

        {/* Embossed 'P' */}
        <g style={{ filter: "url(#relief-shadow)" }}>
            <text
                x="50%"
                y="54%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#B8860B"
                fontSize="38"
                fontFamily="Georgia, serif"
                fontWeight="bold"
                opacity="0.6"
            >
                P
            </text>
            <text
                x="50%"
                y="52%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#FFD700"
                fontSize="38"
                fontFamily="Georgia, serif"
                fontWeight="bold"
                stroke="#FFFDE4"
                strokeWidth="0.5"
                strokeOpacity="0.5"
            >
                P
            </text>
        </g>
    </svg>
);
