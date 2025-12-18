import type { SVGProps } from "react";

export function MindBloomLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2c2.4 0 4.7 1.1 6.3 3.1" />
      <path d="M12 2c-2.4 0-4.7 1.1-6.3 3.1" />
      <path d="M12 22a7 7 0 0 0 7-7" />
      <path d="M12 22a7 7 0 0 1-7-7" />
      <path d="M12 2v6" />
      <path d="M12 12c-4 0-7 3-7 7h14c0-4-3-7-7-7z" />
    </svg>
  );
}
