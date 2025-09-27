"use client";

import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    {...props}
  >
    <defs>
      <radialGradient id="coin-radial" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#FDEB87" />
        <stop offset="60%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#A67C00" />
      </radialGradient>

      <linearGradient id="p-face-light" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FEEF9E" />
        <stop offset="100%" stopColor="#FAD961" />
      </linearGradient>

      <linearGradient id="p-face-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>

      <pattern id="greek-key" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="scale(1)">
        <rect width="6" height="6" fill="transparent" />
        <path d="M0 0h1v5h4v-1h-3v-3h2v-1H0z" fill="#B8860B" />
        <path d="M1 0h5v1h-4v3h2v1H1z" fill="#B8860B" />
      </pattern>
    </defs>

    <circle cx="50" cy="50" r="48" fill="url(#coin-radial)" />

    <circle cx="50" cy="50" r="48" fill="none" stroke="#A67C00" strokeWidth="2" />
    
    <path 
        d="M 50,50 m 45,0 a 45,45 0 1,0 0,0 a 45,45 0 1,0 0,0 
           M 50,50 m 40,0 a 40,40 0 1,1 0,0 a 40,40 0 1,1 0,0 Z" 
        fill="url(#greek-key)" 
        fillRule="evenodd"
        stroke="#8C6D1F"
        strokeWidth="0.5"
        transform="rotate(45, 50, 50)"
    />

    <circle cx="50" cy="50" r="40" fill="url(#coin-radial)" stroke="#8C6D1F" strokeWidth="0.5" />
    
    <path
      d="M 41 73 L 41 33 L 49 29 L 59 33 L 59 73 L 54 73 L 54 58 L 46 58 L 46 73 Z"
      fill="url(#p-face-light)"
      stroke="#8C6D1F"
      strokeWidth="0.5"
    />

    <path
      d="M 49 29 L 50 25 L 59 29 L 50 33 Z"
      fill="url(#p-face-light)"
      stroke="#8C6D1F"
      strokeWidth="0.5"
    />
    
    <path
      d="M 41 33 L 49 29 L 49 33 Z"
      fill="url(#p-face-dark)"
      stroke="#8C6D1F"
      strokeWidth="0.5"
    />
    
    <path
      d="M 59 33 L 59 29 L 49 29 L 50 25 Z"
      fill="url(#p-face-dark)"
      stroke="#8C6D1F"
      strokeWidth="0.5"
    />

    <path
      d="M 46 58 L 54 58 L 54 73 L 46 73 Z"
      fill="url(#p-face-dark)"
      stroke="#8C6D1F"
      strokeWidth="0.5"
    />
    
  </svg>
);
