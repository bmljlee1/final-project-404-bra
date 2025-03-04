import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function CreateProfile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [parentName, setParentName] = useState("");
  const [parent2Name, setParent2Name] = useState(""); // Optional
  const [kids, setKids] = useState([{ name: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validatePassword = () => {
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character."
      );
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    setError(null);

    if (!validatePassword()) return;

    setLoading(true);

    try {
      // ✅ Step 1: Sign up user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw new Error(error.message);

      const authUserId = data?.user?.id;
      if (!authUserId)
        throw new Error("User creation failed. Please try again.");

      // ✅ Step 2: Insert parent into "soc_final_parents"
      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .insert([
          {
            name: parentName,
            name2: parent2Name || null,
            email,
            auth_id: authUserId,
          },
        ])
        .select("id")
        .single();

      console.log("Parent Insert Data:", parentData);
      console.log("Parent Insert Error:", parentError);

      if (parentError || !parentData)
        throw new Error("Error creating parent account.");

      const parentId = parentData.id;

      // ✅ Step 3: Insert kids into "soc_final_kids" (currency defaults to 0)
      const kidInserts = kids
        .filter((kid) => kid.name.trim() !== "")
        .map((kid) => ({
          parent_id: parentId,
          name: kid.name,
        }));

      if (kidInserts.length > 0) {
        const { error: kidError } = await supabase
          .from("soc_final_kids")
          .insert(kidInserts);
        if (kidError) {
          console.error("Error inserting kids:", kidError);
          throw new Error("Error inserting kids.");
        }
      }

      setLoading(false);
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-8 border shadow-md rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Your Profile
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Email & Password Fields */}
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
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 border rounded mb-3"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Parent Information */}
        <h3 className="text-lg font-bold mb-2">Parent Information</h3>
        <input
          type="text"
          placeholder="Parent 1 Name"
          className="w-full p-2 border rounded mb-3"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Parent 2 Name (Optional)"
          className="w-full p-2 border rounded mb-3"
          value={parent2Name}
          onChange={(e) => setParent2Name(e.target.value)}
        />

        {/* Kids Information (Displayed as "Children") */}
        <h3 className="text-lg font-bold mb-2">Children Information</h3>
        {kids.map((kid, index) => (
          <div key={index} className="mb-3">
            <input
              type="text"
              placeholder="Child's Name"
              className="w-full p-2 border rounded mb-2"
              value={kid.name}
              onChange={(e) =>
                setKids(
                  kids.map((c, i) =>
                    i === index ? { ...c, name: e.target.value } : c
                  )
                )
              }
              required
            />
          </div>
        ))}

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-3 cursor-pointer hover:bg-blue-600 transition"
          onClick={() => setKids([...kids, { name: "" }])}
        >
          + Add Another Child
        </button>

        <button
          className="w-full bg-green-500 text-white p-2 rounded cursor-pointer hover:bg-green-600 transition"
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading ? "Creating Profile..." : "Sign Up & Create Profile"}
        </button>
      </div>
    </div>
  );
}
