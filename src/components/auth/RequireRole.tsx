"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";

export default function RequireRole({
  children,
  roles,
}: {
  children: ReactNode;
  roles: string[];
}) {
  const router = useRouter();
  const { user, ready } = useAuth();

  // Normalize role comparison (case-insensitive)
  const userRole = (user?.role ?? "").toLowerCase();
  const allowed = roles.map((r) => r.toLowerCase());
  const hasRole = !!user && allowed.includes(userRole);

  // Perform navigation after render phase to avoid setState during render
  useEffect(() => {
    if (ready && user && !hasRole) {
      router.replace("/");
    }
  }, [ready, user, hasRole, router]);

  // While auth is loading, or redirecting, render nothing
  if (!ready) return null;
  if (!user) return null;
  if (!hasRole) return null;

  return <>{children}</>;
}
