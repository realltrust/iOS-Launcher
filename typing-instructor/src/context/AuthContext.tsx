import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UserRecord } from '../types';
import { getUserByUsername, putUser, uid } from '../lib/db';
import { hashPassword, newSalt } from '../lib/auth';

interface AuthCtx {
  user: UserRecord | null;
  guest: boolean;
  login: (u: string, p: string) => Promise<string | null>;
  register: (u: string, p: string, role?: 'learner' | 'teacher') => Promise<string | null>;
  logout: () => void;
  loginAsGuest: () => void;
  setTheme: (t: 'light' | 'dark') => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
const SESSION_KEY = 'ti:session';
const GUEST_KEY = 'ti:guest';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    (async () => {
      const id = localStorage.getItem(SESSION_KEY);
      if (id) {
        const u = await getUserByUsername(id);
        if (u) setUser(u);
      }
      setGuest(localStorage.getItem(GUEST_KEY) === '1');
    })();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', user?.settings.theme === 'dark');
  }, [user?.settings.theme]);

  const login = async (u: string, p: string) => {
    const rec = await getUserByUsername(u);
    if (!rec) return 'User not found';
    const h = await hashPassword(p, rec.salt);
    if (h !== rec.hash) return 'Incorrect password';
    setUser(rec);
    localStorage.setItem(SESSION_KEY, rec.username);
    localStorage.removeItem(GUEST_KEY);
    setGuest(false);
    return null;
  };

  const register = async (u: string, p: string, role: 'learner' | 'teacher' = 'learner') => {
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(u)) return 'Username must be 3-24 chars (letters, digits, . _ -)';
    if (p.length < 6) return 'Password must be at least 6 characters';
    const exists = await getUserByUsername(u);
    if (exists) return 'Username already taken';
    const salt = newSalt();
    const hash = await hashPassword(p, salt);
    const rec: UserRecord = {
      id: uid(),
      username: u.toLowerCase(),
      salt,
      hash,
      role,
      createdAt: Date.now(),
      settings: { theme: 'light' },
    };
    await putUser(rec);
    setUser(rec);
    localStorage.setItem(SESSION_KEY, rec.username);
    return null;
  };

  const logout = () => {
    setUser(null);
    setGuest(false);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(GUEST_KEY);
  };

  const loginAsGuest = () => {
    setGuest(true);
    localStorage.setItem(GUEST_KEY, '1');
  };

  const setTheme = async (t: 'light' | 'dark') => {
    if (!user) return;
    const next = { ...user, settings: { ...user.settings, theme: t } };
    await putUser(next);
    setUser(next);
  };

  return (
    <Ctx.Provider value={{ user, guest, login, register, logout, loginAsGuest, setTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
