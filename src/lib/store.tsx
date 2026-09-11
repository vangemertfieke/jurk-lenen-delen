import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface SessionUser {
  name: string;
  email: string;
  /** Data-URL van de geüploade profielfoto. */
  avatar?: string;
  /** Woonplaats, bijv. "Amsterdam". */
  city?: string;
  /** Korte introductie op het profiel. */
  bio?: string;
}

interface AppState {
  user: SessionUser | null;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
  setAvatar: (dataUrl: string | null) => void;
  updateProfile: (patch: { name?: string; city?: string | undefined; bio?: string | undefined }) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  hydrated: boolean;
}

const AppContext = createContext<AppState | null>(null);

const USER_KEY = "dressloop.user";
const FAV_KEY = "dressloop.favorites";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      if (u) setUser(JSON.parse(u) as SessionUser);
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f) as string[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const signIn = useCallback((u: SessionUser) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const setAvatar = useCallback((dataUrl: string | null) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: SessionUser = { ...prev };
      if (dataUrl) next.avatar = dataUrl;
      else delete next.avatar;
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProfile = useCallback(
    (patch: { name?: string; city?: string | undefined; bio?: string | undefined }) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: SessionUser = { ...prev, ...patch };
      if (next.city === undefined) delete next.city;
      if (next.bio === undefined) delete next.bio;
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AppState>(
    () => ({
      user,
      signIn,
      signOut,
      setAvatar,
      updateProfile,
      favorites,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
      hydrated,
    }),
    [user, favorites, hydrated, signIn, signOut, setAvatar, updateProfile, toggleFavorite],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp moet binnen AppProvider gebruikt worden");
  return ctx;
}
