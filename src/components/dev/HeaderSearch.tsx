"use client";
import { memo, useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function HeaderSearchImpl() {
  const [q, setQ] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const url = `/products${q ? `?q=${encodeURIComponent(q)}` : ""}`;
      startTransition(() => router.push(url));
    },
    [q, router]
  );

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <input
        className="flex-1 rounded-lg border px-3 py-2"
        placeholder="Search"
        type="search"
        value={q}
        onChange={handleChange}
        autoComplete="off"
      />
      <button
        type="submit"
        className="rounded-lg border px-4 py-2 disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "…" : "Search"}
      </button>
    </form>
  );
}

export default memo(HeaderSearchImpl);
