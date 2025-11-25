"use client";
import { memo } from "react";

type Props = {
  count?: number;
  label?: string;
};

function BadgeImpl({ count = 0, label }: Props) {
  if (!count) return null;
  return (
    <span
      aria-label={label}
      className="absolute -right-1 -top-1 min-w-[1.125rem] rounded-full border border-white bg-rose-600 px-1 text-center text-[0.65rem] font-semibold leading-4 text-white shadow"
    >
      {count}
    </span>
  );
}

function areEqual(a: Props, b: Props) {
  return a.count === b.count && a.label === b.label;
}

export default memo(BadgeImpl, areEqual);
