"use client";
import { memo, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import type { UserLike } from "@/components/molecules/UserDropdown";

type Role = UserLike["role"];

type Props = {
  allowedRoles: Role[];
  whenLoggedOutRedirectTo?: string;
  whenLoggedInRedirectTo?: string;
  children: React.ReactNode;
};

function GuardImpl({
  allowedRoles,
  whenLoggedOutRedirectTo = "/login",
  whenLoggedInRedirectTo = "/",
  children,
}: Props) {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const mappedRole: Role | null = useMemo(() => {
    if (!authUser) return null;
    const raw = (authUser.role ?? "").toString().toLowerCase();
    if (raw.includes("employee")) return "employee";
    if (raw.includes("superadmin") || raw.includes("admin")) return "admin";
    return "shopper";
  }, [authUser?.role]);

  const allowed = useMemo(() => new Set<Role>(allowedRoles), [allowedRoles]);

  useEffect(() => {
    if (!authUser) {
      router.replace(whenLoggedOutRedirectTo);
      return;
    }
    if (!mappedRole || !allowed.has(mappedRole)) {
      router.replace(whenLoggedInRedirectTo);
    }
  }, [
    authUser,
    mappedRole,
    allowed,
    router,
    whenLoggedInRedirectTo,
    whenLoggedOutRedirectTo,
  ]);

  if (!authUser) return null;
  if (!mappedRole || !allowed.has(mappedRole)) return null;

  return <>{children}</>;
}

function areEqual(a: Props, b: Props) {
  if (a.whenLoggedOutRedirectTo !== b.whenLoggedOutRedirectTo) return false;
  if (a.whenLoggedInRedirectTo !== b.whenLoggedInRedirectTo) return false;
  if (a.children !== b.children) return false;
  if (a.allowedRoles.length !== b.allowedRoles.length) return false;
  for (let i = 0; i < a.allowedRoles.length; i++) {
    if (a.allowedRoles[i] !== b.allowedRoles[i]) return false;
  }
  return true;
}

export default memo(GuardImpl, areEqual);
