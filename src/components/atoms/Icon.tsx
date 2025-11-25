"use client";
import { memo } from "react";
import type { JSX, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  name: "search" | "heart" | "cart" | "user" | "chevron-down" | "user-circle";
};

const ICON_PATHS: Record<IconProps["name"], JSX.Element> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  heart: (
    <>
      <path
        d="M12 21s-6-4.35-9-7.35C-1 9.35 3 3 8 5.5 9.6 6.23 11 8 12 9.5 13 8 14.4 6.23 16 5.5 21 3 25 9.35 21 13.65 18 16.65 12 21 12 21Z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l3 12h9l3-8H7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="20" r="1.75" />
      <circle cx="18" cy="20" r="1.75" />
    </>
  ),
  "chevron-down": (
    <>
      <polyline
        points="6 9 12 15 18 9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  "user-circle": (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth={2.25} />
      <circle cx="12" cy="10" r="3" strokeWidth={2.25} />
      <path d="M6.5 18c1.9-3.1 9.1-3.1 11 0" strokeWidth={2.25} />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" strokeWidth="2" />
      <path
        d="M4 20c1.8-3.5 6-4.5 8-4.5s6.2 1 8 4.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
};

function IconImpl({ name, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      {ICON_PATHS[name]}
    </svg>
  );
}

function areEqual(a: IconProps, b: IconProps) {
  return (
    a.name === b.name &&
    a.className === b.className &&
    a.width === b.width &&
    a.height === b.height &&
    a.stroke === b.stroke &&
    a.strokeWidth === b.strokeWidth &&
    a.fill === b.fill
  );
}

export default memo(IconImpl, areEqual);
