"use client";

import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="none"
        {...props}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M45 15C39.4772 15 35 19.4772 35 25V75C35 80.5228 39.4772 85 45 85H55C68.8071 85 80 73.8071 80 60C80 46.1929 68.8071 35 55 35H45V25C45 19.4772 40.5228 15 35 15H25C19.4772 15 15 19.4772 15 25V75C15 80.5228 19.4772 85 25 85H35V75H25V25H35V45H55C63.2843 45 70 51.7157 70 60C70 68.2843 63.2843 75 55 75H45V15Z"
            fill="hsl(var(--primary))"
        />
    </svg>
);