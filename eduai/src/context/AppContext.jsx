import { createContext, useContext, useState, useCallback } from "react";
import { DB } from "../lib/db";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [authed,      setAuthed]      = useState(false);
  const [page,        setPage]        = useState("dashboard");
  const [toast,       setToast]       = useState(null);
  const [, _forceUpdate]              = useState(0);

  const forceUpdate = useCallback(() => _forceUpdate(n => n + 1), []);

  const showToast = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const login = useCallback((u) => {
    setUser(u);
    setAuthed(true);
    setPage("dashboard");
    showToast(`👋 Welcome, ${u.name}!`);
  }, [showToast]);

  const logout = useCallback(() => {
    setAuthed(false);
    setUser(null);
    setPage("dashboard");
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      if (DB.users[prev.email]) Object.assign(DB.users[prev.email], updates);
      return next;
    });
    showToast("✓ Profile updated");
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      user, authed, page, toast,
      setPage, login, logout, updateUser,
      showToast, forceUpdate,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
