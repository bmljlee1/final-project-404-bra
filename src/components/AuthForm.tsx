import { useState, useEffect } from "react";
import { signUp, signIn, signOut, getUser } from "../utils/auth";
import { supabase } from "../utils/supabaseClient";
import { User } from "@supabase/supabase-js";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    async function checkUser() {
      const { data, error } = await getUser();
      if (error) {
        console.error("Error fetching user:", error);
      }
      setUser(data?.user || null);
    }
    checkUser();
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      alert("Sign-up successful! Check your email to confirm your account.");
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setUser(data?.user);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setLoading(false);
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });

    if (error) {
      setError(error.message);
    } else {
      alert(`Signing in with ${provider}...`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {user ? `Welcome, ${user.email}` : "Sign In / Sign Up"}
      </h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {!user ? (
        <>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between">
            <button
              className="bg-blue-500 text-white p-2 rounded w-1/2 mr-2"
              onClick={handleSignUp}
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
            <button
              className="bg-green-500 text-white p-2 rounded w-1/2"
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <button onClick={() => handleOAuthSignIn("google")}>
              Sign in with Google
            </button>
            <button onClick={() => handleOAuthSignIn("github")}>
              Sign in with GitHub
            </button>
          </div>
        </>
      ) : (
        <button
          className="mt-4 bg-red-500 text-white p-2 rounded w-full"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      )}
    </div>
  );
}
