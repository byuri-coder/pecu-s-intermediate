import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 120"
    fill="none"
    {...props}
  >
    <defs>
      <linearGradient
        id="logo-gradient"
        x1="5.16"
        y1="13.5"
        x2="85.53"
        y2="101.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE047" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.1" />
      </filter>
    </defs>
    <g style={{ filter: "url(#logo-shadow)" }}>
      <path
        d="M62.67,65.65,39.3,79,51,85.25,33.5,95.5,22,89.5V40.5L33.5,34.5,51,44.75,39.3,51,62.67,37.35a12,12,0,0,1,12,0L98,51,86.3,57.25,98,63.5,74.67,77.35a12,12,0,0,1,-12,0Z"
        fill="#B45309"
      />
      <path
        d="M74.67,77.35,98,63.5V51L74.67,37.35a12,12,0,0,0-12,0L39.3,51V79l23.37-13.35a12,12,0,0,1,12,0Z"
        fill="url(#logo-gradient)"
      />
      <path
        d="M62.67,65.65a12,12,0,0,0-12,0L39.3,72.15V57.85L51,51,39.3,44.5v-9L62.67,22.15a12,12,0,0,1,12,0L98,35.5v28L86.3,70,98,76.5v-9L74.67,54.15a12,12,0,0,0-12,0Z"
        fill="url(#logo-gradient)"
        fillOpacity="0.5"
      />
    </g>
  </svg>
);
