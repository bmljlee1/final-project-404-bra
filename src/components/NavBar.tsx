import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabaseClient";

interface Kid {
  id: number;
  name: string;
}

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [kids, setKids] = useState<Kid[]>([]);

  useEffect(() => {
    const fetchKids = async () => {
      if (!user) return;

      try {
        // ✅ Step 1: Get parent ID
        const { data: parentData, error: parentError } = await supabase
          .from("soc_final_parents")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        if (parentError) return;

        const parentId = parentData.id;

        // ✅ Step 2: Get only kids belonging to this parent
        const { data: kidsData, error: kidsError } = await supabase
          .from("soc_final_kids")
          .select("id, name")
          .eq("parent_id", parentId);

        if (kidsError) return;

        setKids(kidsData || []);
      } catch (error) {
        console.error("Error fetching kids:", error);
      }
    };

    fetchKids();
  }, [user]);

  const handleKidSelection = (kidId: number) => {
    navigate(`/kid/${kidId}`, { replace: true });
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout(navigate);
  };

  return (
    <nav className="p-4 bg-blue-500 text-white flex justify-between items-center">
      {/* Left: Navigation Links */}
      <ul className="flex space-x-4">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/tasks">Tasks</Link>
        </li>
        <li>
          <Link to="/rewards">Rewards</Link>
        </li>
        <li>
          <Link to="/parent">Parent Profile</Link>
        </li>

        {/* ✅ Kid Profile Dropdown */}
        {kids.length > 0 && (
          <li>
            <select
              className="text-black p-2 rounded"
              onChange={(e) => {
                handleKidSelection(parseInt(e.target.value));
                e.target.value = "";
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Select Child Profile
              </option>
              {kids.map((kid) => (
                <option key={kid.id} value={kid.id}>
                  {kid.name}
                </option>
              ))}
            </select>
          </li>
        )}
      </ul>

      {/* Right: Auth Controls */}
      <div className="flex space-x-4">
        {!user ? (
          <>
            <Link
              to="/login"
              className="bg-white text-blue-500 px-3 py-2 rounded hover:bg-gray-200"
            >
              Login
            </Link>
            <Link
              to="/create-profile"
              className="bg-white text-blue-500 px-3 py-2 rounded hover:bg-gray-200"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-100">Welcome, {user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
