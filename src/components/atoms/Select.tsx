"use client";
import { memo, useMemo } from "react";
import type { ComponentProps } from "react";

type Props = ComponentProps<"select">;

function SelectImpl({ className, children, ...rest }: Props) {
  const cls = useMemo(
    () =>
      `w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 ${
        className || ""
      }`,
    [className]
  );

  return (
    <div className="relative">
      <select {...rest} className={cls}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        ▾
      </span>
    </div>
  );
}

function areEqual(a: Props, b: Props) {
  return (
    a.className === b.className &&
    a.value === b.value &&
    a.defaultValue === b.defaultValue &&
    a.disabled === b.disabled &&
    a.name === b.name &&
    a.id === b.id &&
    a.multiple === b.multiple &&
    a.onChange === b.onChange &&
    a.children === b.children
  );
}

export default memo(SelectImpl, areEqual);
