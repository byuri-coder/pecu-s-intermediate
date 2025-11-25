
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-6 w-6", props.className)}
            {...props}
        >
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" fill="hsl(var(--primary))" stroke="none" />
            <path d="M12 7v10" stroke="hsl(var(--primary-foreground))" />
            <path d="M12 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="hsl(var(--primary-foreground))" stroke="none"/>
        </svg>
    );
};

Logo.displayName = 'Logo';
