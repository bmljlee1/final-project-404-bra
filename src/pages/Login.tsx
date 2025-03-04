import { useState } from "react";
import { signIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth(); // Get refreshUser from AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await signIn(email, password);
    setLoading(false);

    console.log(data);

    if (error) {
      setError(error.message);
    } else {
      await refreshUser(); // Refresh user state
      navigate("/"); // Redirect after login
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-8 border shadow-md rounded-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
