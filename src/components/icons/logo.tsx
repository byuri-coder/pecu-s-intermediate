"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const Logo = (props: React.ComponentProps<typeof Image>) => {
    return (
        <Image
            src="/logo.png"
            alt="PECU'S INTERMEDIATE Logo"
            width={32}
            height={32}
            className={cn("h-8 w-8", props.className)}
            {...props}
        />
    );
};

Logo.displayName = 'Logo';
