"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "../atoms/Icon";
import Avatar from "../atoms/Avatar";

export type Role = "shopper" | "employee" | "admin";
export type UserLike = {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: Role;
};

export function UserDropdown({
  user,
  onLogout,
  onGoToPortal,
}: {
  user: UserLike;
  onLogout?: () => void;
  onGoToPortal?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const role = (user.role ?? "").toString().toLowerCase();
  const isEmployee = role === "employee" || role === "admin";
  const menuId = "user-dropdown-menu";

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current || !menuRef.current) return;
      if (btnRef.current.contains(t) || menuRef.current.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const hasAvatar = !!user.avatarUrl;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-gray-100"
      >
        {hasAvatar ? (
          <Avatar src={user.avatarUrl} alt={user.name} />
        ) : (
          <Icon name="user" width={20} height={20} />
        )}
        <span className="max-w-[10rem] truncate">{user.name}</span>
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-white shadow-lg z-50"
        >
          {isEmployee && (
            <button
              onClick={onGoToPortal}
              className="block w-full text-left px-4 py-2 hover:bg-gray-50"
            >
              Employee portal
            </button>
          )}
          <Link href="/favorites" className="block px-4 py-2 hover:bg-gray-50">
            Favorites
          </Link>
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function GuestDropdown({
  onSignIn,
  onSignUp,
}: {
  onSignIn?: () => void;
  onSignUp?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = "guest-dropdown-menu";

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current || !menuRef.current) return;
      if (btnRef.current.contains(t) || menuRef.current.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-2 rounded-full px-3 hover:bg-neutral-100"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Account"
      >
        <Icon name="user" width={20} height={20} />
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-white shadow-lg z-50"
        >
          <button
            onClick={onSignIn}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50"
          >
            Sign in
          </button>
          <button
            onClick={onSignUp}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50"
          >
            Create account
          </button>
          <Link
            href="/forgot-password"
            className="block px-4 py-2 hover:bg-gray-50"
          >
            Forgot password
          </Link>
        </div>
      )}
    </div>
  );
}
