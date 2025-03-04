import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <li>
          <Link to="/kid-dashboard/1">Kid Dashboard</Link>
        </li>
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
