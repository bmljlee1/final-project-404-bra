import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getUser, signOut } from "../utils/auth";

interface AuthContextType {
  user: { id: string; email: string } | null;
  loading: boolean;
  logout: (navigate: (path: string) => void) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    const { data } = await getUser();
    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email ?? "",
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async (navigate: (path: string) => void) => {
    await signOut();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
