"use client";
import { memo } from "react";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

function LabelImpl({ children }: Props) {
  return (
    <div className="mb-2 text-sm font-semibold text-gray-800 md:text-base">
      {children}
    </div>
  );
}

function areEqual(a: Props, b: Props) {
  return a.children === b.children;
}

export default memo(LabelImpl, areEqual);
