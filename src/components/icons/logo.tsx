"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const Logo = (props: React.ComponentProps<typeof Image>) => {
    return (
        <Image
            src="https://placehold.co/64x64/1e3a4b/ffffff?text=P"
            alt="PECU'S INTERMEDIATE Logo"
            width={32}
            height={32}
            className={cn("h-8 w-8", props.className)}
        />
    );
};

Logo.displayName = 'Logo';
