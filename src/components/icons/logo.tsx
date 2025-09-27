"use client";

import Image from 'next/image';
import * as React from "react";

export const Logo = (props: React.ComponentProps<typeof Image>) => {
  const { className, ...rest } = props;
  return (
    <Image
      src="/logo.png"
      alt="PECU'S INTERMEDIATE Logo"
      width={100}
      height={100}
      className={className}
      {...rest}
    />
  );
};
