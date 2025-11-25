"use client";
import { memo, useMemo } from "react";

type Props = {
  src?: string;
  alt?: string;
  size?: number;
};

function AvatarImpl({ src, alt = "", size = 24 }: Props) {
  const boxStyle = useMemo(() => ({ width: size, height: size }), [size]);

  if (!src) {
    return (
      <div
        style={boxStyle}
        className="rounded-full border border-neutral-300"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  );
}

function areEqual(a: Props, b: Props) {
  return a.src === b.src && a.alt === b.alt && a.size === b.size;
}

export default memo(AvatarImpl, areEqual);
