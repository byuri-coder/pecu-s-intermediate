import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="none"
        {...props}
    >
        <defs>
            <radialGradient id="gold-grad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#fefce8" />
                <stop offset="25%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>
            <filter id="emboss" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.7" result="blur" />
                <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.8" specularExponent="15" lightingColor="#fde047" result="specOut">
                    <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
                <feMerge>
                    <feMergeNode in="offsetBlur" />
                    <feMergeNode in="litPaint" />
                </feMerge>
            </filter>
            <path id="text-path-top" d="M10,50 a40,40 0 1,1 80,0" />
            <path id="text-path-bottom" d="M15,50 a35,35 0 1,0 70,0" />
        </defs>

        {/* Base da Moeda */}
        <circle cx="50" cy="50" r="49" fill="url(#gold-grad)" stroke="#854d0e" strokeWidth="1" />
        
        {/* Borda Serrilhada */}
        <g stroke="#a16207" strokeWidth="0.5">
            {[...Array(90)].map((_, i) => (
                <path
                    key={i}
                    d={`M ${50 + 48 * Math.cos(i * 4 * Math.PI / 180)} ${50 + 48 * Math.sin(i * 4 * Math.PI / 180)} L ${50 + 50 * Math.cos((i * 4 + 1) * Math.PI / 180)} ${50 + 50 * Math.sin((i * 4 + 1) * Math.PI / 180)}`}
                />
            ))}
        </g>
        <circle cx="50" cy="50" r="47.5" fill="none" stroke="#b45309" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#a16207" strokeWidth="1.5" opacity="0.7"/>

        <g style={{ filter: "url(#emboss)" }} fill="#ca8a04" fontFamily="Georgia, serif" textAnchor="middle">
             {/* Texto Superior */}
            <text fontSize="7" letterSpacing="0.1">
                <textPath href="#text-path-top" startOffset="50%">
                    PECU'S INTERMEDIATE
                </textPath>
            </text>

            {/* Texto Inferior (data) */}
            <text fontSize="7">
                <textPath href="#text-path-bottom" startOffset="50%">
                    MMXXIV
                </textPath>
            </text>

            {/* Letra 'P' central em relevo */}
            <g transform="translate(0, 2)">
                <text
                    x="50%"
                    y="52%"
                    dominantBaseline="middle"
                    fontSize="42"
                    fontWeight="bold"
                    fill="#854d0e"
                    opacity="0.6"
                >
                    P
                </text>
                 <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    fontSize="42"
                    fontWeight="bold"
                    fill="#fde047"
                    stroke="#fefce8"
                    strokeWidth="0.3"
                >
                    P
                </text>
            </g>
        </g>
    </svg>
);
