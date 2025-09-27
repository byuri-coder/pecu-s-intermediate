"use client";

import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    {...props}
  >
    <defs>
      <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: "rgb(255,235,179)", stopOpacity: 1 }} />
        <stop offset="70%" style={{ stopColor: "rgb(251,213,109)", stopOpacity: 1 }} />
        <stop offset="90%" style={{ stopColor: "rgb(193,147,41)", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "rgb(164,120,24)", stopOpacity: 1 }} />
      </radialGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#FDE08D", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#C19329", stopOpacity: 1 }} />
      </linearGradient>
      <pattern id="greek-pattern" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="scale(0.8)">
        <path d="M0 0H10V10H0Z" fill="none"/>
        <path d="M0 0H7V7H3V3H5" stroke="#B88E2D" strokeWidth="0.8" fill="none"/>
      </pattern>
      <filter id="texture" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.1 0" />
        <feComposite operator="in" in2="SourceGraphic" result="textured"/>
        <feBlend in="SourceGraphic" in2="textured" mode="multiply" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="49" fill="url(#grad1)" stroke="#A47818" strokeWidth="1"/>
    <circle cx="50" cy="50" r="48" fill="url(#grad1)" filter="url(#texture)" opacity="0.4"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#greek-pattern)" strokeWidth="8"/>
    <path
      d="M40 30 L40 75 L45 75 L45 55 L60 55 L60 50 L45 50 L45 35 L60 35 C62 35 65 38 65 40 L65 45 L50 45 L50 40 L60 40 L60 35 L45 35 L45 30 Z"
      fill="#FAD97A"
      stroke="#B5862E"
      strokeWidth="0.5"
    >
        <animate attributeName="fill" values="#FAD97A;#FFEBCD;#FAD97A" dur="5s" repeatCount="indefinite" />
    </path>
    <path
        d="M 50 30 L 55 25 L 60 30 L 55 35 Z"
        fill="#FDE08D"
        stroke="#B5862E"
        strokeWidth="0.5"
    />
  </svg>
);

Logo.displayName = 'Logo';