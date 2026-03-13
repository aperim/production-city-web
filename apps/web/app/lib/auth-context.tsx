"use client";

/**
 * Auth context: provides user, permissions, and session state to all components.
 * Authentication is cookie-only — no tokens stored in JS.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSession, logout as logoutApi } from "./api-client";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  status: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Read the auth context. Throws if used outside AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider: fetches session on mount, provides auth state to tree.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getSession();
      if (result.ok) {
        setUser(result.data.user);
        setRoles(result.data.roles);
        setPermissions(result.data.permissions);
      } else {
        setUser(null);
        setRoles([]);
        setPermissions([]);
      }
    } catch {
      setUser(null);
      setRoles([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    setRoles([]);
    setPermissions([]);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value: AuthContextValue = {
    user,
    roles,
    permissions,
    isAuthenticated: user !== null,
    isLoading,
    logout,
    refreshSession,
    hasPermission,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
