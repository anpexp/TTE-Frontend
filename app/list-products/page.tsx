"use client";

import RequireRole from "@/components/auth/RequireRole";
import ListProductsPage from "@/components/pages/ListProductsPage";

export default function ListProducts() {
  return (
    <RequireRole roles={["employee", "admin", "superadmin"]}>
      <ListProductsPage />
    </RequireRole>
  );
}
