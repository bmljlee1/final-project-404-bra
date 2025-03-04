import { useEffect, useState } from "react";
import { getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await getUser();

      if (!data?.user || !data.user.email) {
        navigate("/login");
      } else {
        setUser({
          id: data.user.id,
          email: data.user.email ?? "", // Ensure email is always a string
        });
      }
    }
    checkAuth();
  }, [navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
