"use client";
import { memo, useCallback, useMemo } from "react";
import { Button } from "../atoms";
import type { UserLike } from "../molecules/UserDropdown";

type Props = { setUser: (u: UserLike | null) => void };

function ScenarioSwitcherImpl({ setUser }: Props) {
  const wrapperCls =
    "fixed bottom-4 right-4 z-[60] flex gap-2 rounded-xl border border-neutral-200 bg-white/90 p-2 shadow";

  const shopperUser = useMemo<UserLike>(
    () => ({ id: "c1", name: "Jengrik", role: "shopper" }),
    []
  );
  const employeeUser = useMemo<UserLike>(
    () => ({ id: "e1", name: "Employee", role: "employee" }),
    []
  );

  const setGuest = useCallback(() => {
    try {
      localStorage.clear();
    } catch {}
    setUser(null);
  }, [setUser]);

  const setShopper = useCallback(() => {
    try {
      localStorage.setItem("token", "t");
      localStorage.setItem("username", shopperUser.name);
      localStorage.setItem("role", shopperUser.role as string);
    } catch {}
    setUser(shopperUser);
  }, [setUser, shopperUser]);

  const setEmployee = useCallback(() => {
    try {
      localStorage.setItem("token", "t");
      localStorage.setItem("username", employeeUser.name);
      localStorage.setItem("role", employeeUser.role as string);
    } catch {}
    setUser(employeeUser);
  }, [setUser, employeeUser]);

  return (
    <div className={wrapperCls}>
      <Button size="sm" onClick={setGuest}>
        Guest
      </Button>
      <Button size="sm" onClick={setShopper}>
        Shopper
      </Button>
      <Button size="sm" onClick={setEmployee}>
        Employee
      </Button>
    </div>
  );
}

function areEqual(a: Props, b: Props) {
  return a.setUser === b.setUser;
}

export default memo(ScenarioSwitcherImpl, areEqual);
