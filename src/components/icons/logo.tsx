import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <defs>
      <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L4 6.5V15.5L12 20L20 15.5V6.5L12 2Z M12 4.23L18 7.5V14.5L12 17.77L6 14.5V7.5L12 4.23Z M12 7L8 9.5V13.5L12 16L16 13.5V9.5L12 7Z M12 8.62L14.5 10.25V12.75L12 14.38L9.5 12.75V10.25L12 8.62Z"
      fill="url(#gold-gradient)"
    />
  </svg>
);
