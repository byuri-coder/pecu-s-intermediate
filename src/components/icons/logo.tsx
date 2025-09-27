"use client";

import * as React from "react";
import Image from "next/image";

export const Logo = (props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) => {
    // Removemos width e height dos props para evitar conflito com os valores fixos
    const { width, height, ...rest } = props;

    return (
        <Image
            src="/logo.png"
            alt="PECU'S INTERMEDIATE Logo"
            width={100}
            height={100}
            priority // Ajuda a carregar o logo mais rápido
            {...rest}
        />
    );
};

Logo.displayName = 'Logo';