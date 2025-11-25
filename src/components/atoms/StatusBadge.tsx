"use client";
import { memo, useMemo } from "react";

type Props = { status: string };

function StatusBadgeImpl({ status }: Props) {
  const cls = useMemo(() => {
    const colors: Record<string, string> = {
      Confirmed: "bg-green-100 text-green-800",
      "In Process": "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return `px-2 py-1 rounded text-xs font-medium ${
      colors[status] || "bg-gray-100 text-gray-800"
    }`;
  }, [status]);

  return <span className={cls}>{status}</span>;
}

function areEqual(a: Props, b: Props) {
  return a.status === b.status;
}

export default memo(StatusBadgeImpl, areEqual);
