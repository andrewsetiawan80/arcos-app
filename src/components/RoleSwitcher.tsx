import React from "react";
import { useAuth, Role } from "../state/auth";

export default function RoleSwitcher() {
  const role = useAuth((s) => s.role);
  const setRole = useAuth((s) => s.setRole);
  const roles: Role[] = ["admin", "engineer", "production", "sales"];

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-400">Role:</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="bg-transparent border border-white/10 rounded-md px-2 py-1"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
