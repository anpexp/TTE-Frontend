"use client";
import { memo, useId, useMemo } from "react";
import type React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  label?: string;
  error?: string | null;
};

function InputImpl({
  leftIcon,
  rightSlot,
  className = "",
  label,
  error,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const inputClass = useMemo(() => {
    const paddings = `${leftIcon ? "pl-10" : "pl-3"} ${
      rightSlot ? "pr-12" : "pr-3"
    }`;
    return [
      "w-full rounded-md border border-neutral-300 bg-white py-2 text-sm outline-none ring-offset-2 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-black/20",
      paddings,
      className,
    ].join(" ");
  }, [leftIcon, rightSlot, className]);

  return (
    <div className="mb-4">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={inputClass}
          {...rest}
        />
        {rightSlot ? (
          <span className="absolute right-1 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function areEqual(a: InputProps, b: InputProps) {
  return (
    a.leftIcon === b.leftIcon &&
    a.rightSlot === b.rightSlot &&
    a.className === b.className &&
    a.label === b.label &&
    a.error === b.error &&
    a.id === b.id &&
    a.disabled === b.disabled &&
    a.value === b.value &&
    a.placeholder === b.placeholder &&
    a.type === b.type &&
    a.name === b.name
  );
}

export default memo(InputImpl, areEqual);
