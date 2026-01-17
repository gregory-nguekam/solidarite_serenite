import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "./roles";
import { hasAtLeastRole } from "./roles";
import type { JSX } from "@emotion/react/jsx-runtime";

export function ProtectedRoute({
  children,
  minRole = "VISITOR",
}: {
  children: JSX.Element;
  minRole?: Role;
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!hasAtLeastRole(user.role, minRole)) return <Navigate to="/unauthorized" replace />;

  return children;
}
