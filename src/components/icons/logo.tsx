"use client";

import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    {...props}
  >
    <defs>
      <linearGradient id="coin-gradient-main" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#FDEEBE" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
       <linearGradient id="p-gradient-fold" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#FCE3A5" />
        <stop offset="50%" stopColor="#E7B448" />
        <stop offset="100%" stopColor="#C4932A" />
      </linearGradient>
      <pattern id="greek-key" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="scale(0.8)">
          <path d="M0 0h10v10H0z" fill="#B8860B" />
          <path d="M0 0h1v9h8v-1h-7v-7h6v-1h-7z" fill="#FDEEBE" />
      </pattern>
    </defs>

    {/* Coin Body */}
    <circle cx="50" cy="50" r="48" fill="url(#coin-gradient-main)" stroke="#8C6D1F" strokeWidth="1"/>

    {/* Greek Key Border */}
    <circle cx="50" cy="50" r="42" fill="url(#greek-key)" stroke="#A07B1E" strokeWidth="1.5" />

    {/* Inner circle to contain the P */}
    <circle cx="50" cy="50" r="36" fill="url(#coin-gradient-main)" stroke="#8C6D1F" strokeWidth="1" />

    {/* Stylized P */}
    <path 
      d="M40 70 V 30 L 50 25 L 60 30 V 45 L 70 50 L 60 55 L 60 70 H 55 L 50 65 L 45 70 H 40 Z"
      fill="url(#p-gradient-fold)" 
      stroke="#8C6D1F" 
      strokeWidth="1.5"
    />
  </svg>
);